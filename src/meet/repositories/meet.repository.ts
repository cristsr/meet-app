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
    this.rooms.get(room).add(socket.data.id);
    this.sockets.set(socket.data.id, socket);
  }

  leaveRoom(room: string, socket: Socket): void {
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(socket.data.id);
    }
    this.sockets.delete(socket.data.id);
  }

  getRoomSockets(room: string): Socket[] {
    const ids = Array.from(this.rooms.get(room).values());

    if (!ids) {
      return [];
    }

    return ids.map((id) => this.sockets.get(id));
  }
}
