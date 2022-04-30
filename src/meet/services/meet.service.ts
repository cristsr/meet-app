import { Injectable } from '@nestjs/common';
import { CreateMeetDto } from '../dto/create-meet.dto';

@Injectable()
export class MeetService {
  create(createMeetDto: CreateMeetDto) {
    return 'This action adds a new meet';
  }

  joinRoom(roomUuid: string) {
    return roomUuid;
  }
}
