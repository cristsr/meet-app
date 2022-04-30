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

  handleConnection(client: Socket): void {
    client.id = randomBytes(10).toString('hex');
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  onJoin(client: Socket, { room, peer }): void {
    this.logger.log(`Client ${client.id} joined room ${room}`);

    this.meetRepository.joinRoom(room, client);

    const sockets = this.meetRepository.getRoomSockets(room);

    console.log(sockets);

    sockets.forEach((socket: Socket) => {
      socket.emit('joined', JSON.stringify({ id: client.id, peer }));
    });

    this.server.emit('joined', JSON.stringify({ id: client.id, peer }));
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
