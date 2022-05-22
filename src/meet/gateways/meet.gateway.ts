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
    // Initialize socket data
    socket.data = {
      room: null,
      name: null,
      peer: null,
    };

    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket): void {
    const data = socket.data;

    if (data.room) {
      this.leaveRoom(socket, data.room);
    }

    this.meetRepository.removeSocket(socket.id);

    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('join')
  onJoin(socket: Socket, { room, name, peer }: Record<string, string>): void {
    // Check if socket is already in room
    if (this.meetRepository.socketInRoom(room, socket.id)) {
      this.logger.log(`Client ${socket.id} already joined room ${room}`);
      return;
    }

    // Set socket data
    socket.data = {
      room,
      name,
      peer,
    };

    // Add socket to repository
    this.meetRepository.addSocket(socket);

    // Join socket to room
    this.meetRepository.joinRoom(room, socket.id);

    // Get sockets in room
    const sockets = this.meetRepository.getSocketsInRoom(room);

    // Emit event to users in room
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

    // Emit event to self
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
    this.leaveRoom(socket, room);
  }

  private leaveRoom(socket: Socket, room: string): void {
    // Check if socket left room
    if (!this.meetRepository.socketInRoom(room, socket.id)) {
      this.logger.log(`Client ${socket.id} already left room ${room}`);
      return;
    }

    // Leave socket from room
    this.meetRepository.leaveRoom(room, socket.id);

    // Notify to room that user left
    this.meetRepository
      .getSocketsInRoom(room)
      .filter((_socket: Socket) => _socket.id !== socket.id)
      .forEach((_socket: Socket) => {
        _socket.emit('leave', socket.id);
      });

    this.logger.log(`Client ${socket.id} left room ${room}`);
  }
}
