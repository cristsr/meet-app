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
  onJoin(socket: Socket, { room, name }): void {
    this.logger.log(`Client ${socket.data.id} joined room ${room}`);

    socket.data.name = name;

    this.meetRepository.joinRoom(room, socket);

    const sockets = this.meetRepository.getRoomSockets(room);

    const payload = { event: 'join', data: { id: socket.data.id, name } };

    sockets.forEach((socket: Socket) => {
      socket.send(JSON.stringify(payload));
    });
  }

  @SubscribeMessage('leave')
  onLeave(socket: Socket, { room }): void {
    this.logger.log(`Client ${socket.data.id} left room ${room}`);

    this.meetRepository.leaveRoom(room, socket);

    const sockets = this.meetRepository.getRoomSockets(room);

    const payload = { event: 'leave', data: { id: socket.data.id } };

    sockets.forEach((socket: Socket) => {
      socket.send(JSON.stringify(payload));
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
