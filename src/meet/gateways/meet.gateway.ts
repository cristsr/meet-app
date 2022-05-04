import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer as WsServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'meet/types';
import { MeetRepository } from 'meet/repositories';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/meet' })
export class MeetGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(MeetGateway.name);

  @WsServer()
  private server: Server;

  constructor(private meetRepository: MeetRepository) {}

  handleConnection(socket: Socket): void {
    socket.data = {};
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket): void {
    this.logger.log(`Client disconnected: ${socket.id}`);
    this.onLeave(socket, socket.data.room);
    this.meetRepository.removeSocket(socket.id);
  }

  @SubscribeMessage('join')
  onJoin(socket: Socket, { room, name, peer }): void {
    if (this.meetRepository.socketJoined(room, socket.id)) {
      this.logger.log(
        `Client ${socket.id} - ${name} already joined room ${room}`,
      );
      return;
    }

    socket.data.name = name;
    socket.data.peer = peer;
    socket.data.room = room;

    this.meetRepository.addSocket(socket);
    this.meetRepository.joinRoom(room, socket.id);

    const sockets = this.meetRepository.getRoomSockets(room);

    sockets.forEach((_socket: Socket) => {
      if (_socket.id === socket.id) {
        return;
      }

      _socket.emit('userConnected', {
        id: socket.id,
        peer: socket.data.peer,
        name: socket.data.name,
      });
    });

    socket.emit('users', {
      users: sockets.map((socket: Socket) => ({
        id: socket.id,
        peer: socket.data.peer,
        name: socket.data.name,
      })),
    });

    this.logger.log(`Client ${socket.id} - ${name} joined room ${room}`);
  }

  @SubscribeMessage('leave')
  onLeave(socket: Socket, room: string): void {
    if (!this.meetRepository.socketJoined(room, socket.id)) {
      this.logger.log(
        `Client ${socket.id} - ${socket.data.name} already left room ${room}`,
      );

      return;
    }

    this.meetRepository.leaveRoom(room, socket.id);

    this.meetRepository
      .getRoomSockets(room)
      .filter((_socket: Socket) => _socket.id !== socket.id)
      .forEach((_socket: Socket) => {
        _socket.emit('leave', socket.id);
      });

    this.logger.log(
      `Client ${socket.id} - ${socket.data.name} left room ${room}`,
    );
  }
}
