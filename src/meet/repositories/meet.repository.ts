import { Injectable } from '@nestjs/common';
import { Socket } from 'meet/types';

@Injectable()
export class MeetRepository {
  sockets = new Map<string, Socket>();
  rooms = new Map<string, Set<string>>();

  joinRoom(room: string, socketId: string): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(socketId);
  }

  leaveRoom(room: string, socketId: string): void {
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(socketId);
    }
  }

  addSocket(socket: Socket): void {
    this.sockets.set(socket.id, socket);
  }

  removeSocket(socketId: string): void {
    this.sockets.delete(socketId);
  }

  socketInRoom(room: string, socketId: string): boolean {
    if (this.rooms.has(room)) {
      return this.rooms.get(room).has(socketId);
    }
    return false;
  }

  getSocketsInRoom(room: string): Socket[] {
    this.rooms.get(room).forEach((socketId) => {
      if (!this.sockets.has(socketId)) {
        this.rooms.get(room).delete(socketId);
      }
    });

    const ids = Array.from(this.rooms.get(room).values());

    return ids.map((id: string) => this.sockets.get(id));
  }
}
