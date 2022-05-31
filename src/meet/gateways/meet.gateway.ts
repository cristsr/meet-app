import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer as WsServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Session, Socket } from 'meet/types';
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

    this.logger.log(`Socket connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket): void {
    // If socket is in room, remove it from room
    if (socket.data.room) {
      this.leaveRoom(socket);
    }

    // Remove socket from repository
    this.meetRepository.removeSocket(socket.id);

    this.logger.log(`Socket disconnected: ${socket.id}`);
  }

  @SubscribeMessage('createRoom')
  createRoom(socket: Socket) {
    const room = this.meetRepository.createRoom();
    socket.emit('createRoom', room);
  }

  @SubscribeMessage('join')
  join(socket: Socket, { room, name, peer }: Session): void {
    // Verify if room exists
    if (!this.meetRepository.existRoom(room)) {
      socket.emit('error', { code: 404, message: 'Room not found' });
      return;
    }

    // Check if socket is already in room
    if (this.meetRepository.isSocketInRoom(room, socket.id)) {
      this.logger.log(`Socket ${socket.id} already joined room ${room}`);
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

    // Emit event to self
    socket.emit('users', {
      users: sockets.map((s: Socket) => ({
        id: s.id,
        peer: s.data.peer,
        name: s.data.name,
      })),
    });

    // Emit event to users in room
    sockets
      .filter((s: Socket) => s.id !== socket.id)
      .forEach((s: Socket) => {
        s.emit('userConnected', {
          id: socket.id,
          peer: socket.data.peer,
          name: socket.data.name,
        });
      });

    this.logger.log(`Socket ${socket.id} - ${name} joined room ${room}`);
  }

  @SubscribeMessage('leave')
  leave(socket: Socket): void {
    this.leaveRoom(socket);
  }

  private leaveRoom(socket: Socket): void {
    const room = socket.data.room;

    // Do nothing if room is not set
    if (!room) {
      return;
    }

    // Check room exists
    if (!this.meetRepository.existRoom(room)) {
      this.logger.log(`Room not found: ${room}`);
      return;
    }

    // Check if socket left room
    if (!this.meetRepository.isSocketInRoom(room, socket.id)) {
      this.logger.log(`Client ${socket.id} already left room ${room}`);
      return;
    }

    // Leave socket from room
    this.meetRepository.leaveRoom(room, socket.id);

    // Set room to null
    socket.data.room = null;

    // Notify to room that user left
    this.meetRepository
      .getSocketsInRoom(room)
      .forEach((s: Socket) => s.emit('leave', socket.id));

    this.logger.log(`Client ${socket.id} left room ${room}`);
  }
}
