import { Injectable } from '@nestjs/common';
import { MeetRepository } from 'meet/repositories';

@Injectable()
export class MeetService {
  constructor(private meetRepository: MeetRepository) {}

  joinRoom(uuid: string) {
    return uuid;
  }
}
