import { Controller, Get, Param } from '@nestjs/common';
import { MeetService } from 'meet/services';
import { randomBytes } from 'crypto';

@Controller('meet')
export class MeetController {
  constructor(private readonly meetService: MeetService) {}

  @Get()
  meetCode(): string {
    const part1 = randomBytes(3).toString('hex');
    const part2 = randomBytes(4).toString('hex');
    const part3 = randomBytes(3).toString('hex');
    return `${part1}-${part2}-${part3}`;
  }

  @Get(':roomUuid')
  async joinRoom(@Param('roomUuid') roomUuid: string) {
    return this.meetService.joinRoom(roomUuid);
  }

  @Get(':uuid')
  async validateRoom(@Param('uuid') roomUuid: string) {
    return this.meetService.joinRoom(roomUuid);
  }
}
