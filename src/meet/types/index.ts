import { Socket as WebSocket } from 'socket.io';

export interface Socket extends WebSocket {
  data: Record<string, any>;
}
