import { Injectable } from '@nestjs/common';
import { Socket } from 'meet/types';
import { randomBytes } from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MeetRepository {
  private sockets = new Map<string, Socket>();
  private rooms = new Map<string, Set<string>>();

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  deleteEmptyRooms(): void {
    Array.from(this.rooms.entries())
      .filter(([, room]) => !room.size)
      .forEach(([id]) => this.rooms.delete(id));
  }

  existRoom(room: string): boolean {
    return this.rooms.has(room);
  }

  createRoom(): string {
    // Generate a random room name
    const room = 'xxx-xxx-xxx'.replace(/xxx/g, () =>
      randomBytes(3).toString('hex').slice(0, 3),
    );

    // Verify if the room already exists
    if (this.rooms.has(room)) {
      return this.createRoom();
    }

    // Create the room
    this.rooms.set(room, new Set());

    return room;
  }

  joinRoom(room: string, socketId: string): void {
    if (!this.rooms.has(room)) {
      return;
    }
    this.rooms.get(room).add(socketId);
  }

  leaveRoom(room: string, socketId: string): void {
    if (!this.rooms.has(room)) {
      return;
    }

    // Remove socket from room
    this.rooms.get(room).delete(socketId);
  }

  getSocketsInRoom(room: string): Socket[] {
    // Return empty array if room not exist
    const socketIds = Array.from(this.rooms.get(room)?.values() || []);
    return socketIds.map((id: string) => this.sockets.get(id));
  }

  addSocket(socket: Socket): void {
    this.sockets.set(socket.id, socket);
  }

  removeSocket(socketId: string): void {
    this.sockets.delete(socketId);
  }

  isSocketInRoom(room: string, socketId: string): boolean {
    if (!this.rooms.has(room)) {
      return false;
    }

    return this.rooms.get(room).has(socketId);
  }
}
