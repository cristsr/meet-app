import { Socket as WebSocket } from 'socket.io';

export interface Session {
  room: string;
  name: string;
  peer: string;
}

export interface Socket extends WebSocket {
  data: Session;
}
