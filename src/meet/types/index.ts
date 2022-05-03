import { WebSocket } from 'ws';

export interface Socket extends WebSocket {
  data: Record<string, any>;
}
