import { Injectable } from '@nestjs/common';
import { Socket } from 'meet/types';

@Injectable()
export class MeetRepository {
  sockets = new Map<string, Socket>();
  rooms = new Map<string, Set<string>>();

  addSocket(socket: Socket) {
    this.sockets.set(socket.id, socket);
  }

  removeSocket(socketId: string) {
    this.sockets.delete(socketId);
  }

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

  getRoomSockets(room: string): Socket[] {
    const ids = Array.from(this.rooms.get(room).values()).filter((id) => {
      if (this.sockets.has(id)) {
        return true;
      }

      this.rooms.get(room).delete(id);

      return false;
    });

    if (!ids) {
      return [];
    }

    return ids.map((id) => this.sockets.get(id));
  }

  getAllSockets(): Socket[] {
    return Array.from(this.sockets.values());
  }
}
