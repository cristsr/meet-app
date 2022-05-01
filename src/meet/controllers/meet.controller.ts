import { Controller, Get, Param } from '@nestjs/common';
import { MeetService } from 'meet/services';

@Controller('meet')
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @Get(':roomUuid')
  async joinRoom(@Param('roomUuid') roomUuid: string) {
    return this.meetService.joinRoom(roomUuid);
  }
}
