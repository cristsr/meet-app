import { Injectable } from '@nestjs/common';
import { Socket } from 'meet/types';

@Injectable()
export class MeetRepository {
  sockets = new Map<string, Socket>();
  rooms = new Map<string, Set<string>>();

  joinRoom(room: string, socket: Socket): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(socket.id);
    this.sockets.set(socket.id, socket);
  }

  leaveRoom(room: string, socket: Socket): void {
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(socket.id);
    }
    this.sockets.delete(socket.id);
  }

  getRoomSockets(room: string): Socket[] {
    const ids = Array.from(this.rooms.get(room).values());

    if (!ids) {
      return [];
    }

    return ids.map((id) => this.sockets.get(id));
  }

  getAllSockets(): Socket[] {
    return Array.from(this.sockets.values());
  }
}
