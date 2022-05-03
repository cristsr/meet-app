import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer as WsServer,
} from '@nestjs/websockets';
import { randomBytes } from 'crypto';
import { WebSocketServer } from 'ws';
import { Socket } from 'meet/types';
import { MeetRepository } from 'meet/repositories';
import { Logger } from '@nestjs/common';
import { serialize } from 'class-transformer';

@WebSocketGateway({ path: '/meet' })
export class MeetGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(MeetGateway.name);

  @WsServer()
  private server: WebSocketServer;

  constructor(private meetRepository: MeetRepository) {}

  handleConnection(socket: Socket): void {
    socket.data = {};
    socket.data.id = randomBytes(10).toString('hex');

    this.logger.log(`Client connected: ${socket.data.id}`);
  }

  handleDisconnect(socket: Socket): void {
    this.logger.log(`Client disconnected: ${socket.data.id}`);
  }

  @SubscribeMessage('join')
  onJoin(socket: Socket, { room, name, peer }): void {
    this.logger.log(`Client ${socket.data.id} - ${name} joined room ${room}`);

    socket.data.name = name;
    socket.data.peer = peer;

    this.meetRepository.joinRoom(room, socket);

    const sockets = this.meetRepository.getRoomSockets(room);

    sockets.forEach((_socket: Socket) => {
      if (_socket.data.id === socket.data.id) {
        return;
      }

      _socket.send(
        serialize({
          event: 'userConnected',
          data: {
            id: socket.data.id,
            peer: socket.data.peer,
            name: socket.data.name,
          },
        }),
      );
    });

    socket.send(
      serialize({
        event: 'users',
        data: {
          users: sockets.map((socket: Socket) => ({
            id: socket.data.id,
            peer: socket.data.peer,
            name: socket.data.name,
          })),
        },
      }),
    );
  }

  @SubscribeMessage('leave')
  onLeave(socket: Socket, { room }): void {
    const { id, name } = socket.data;

    this.logger.log(`Client ${id} - ${name} left room ${room}`);

    this.meetRepository.leaveRoom(room, socket);

    const sockets = this.meetRepository.getRoomSockets(room);

    const payload = { event: 'leave', data: { id } };

    sockets.forEach((socket: Socket) => {
      socket.send(JSON.stringify(payload));
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
