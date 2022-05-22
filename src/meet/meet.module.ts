import { Module } from '@nestjs/common';
import { MeetGateway } from 'meet/gateways';
import { MeetRepository } from 'meet/repositories';

@Module({
  providers: [MeetGateway, MeetRepository],
})
export class MeetModule {}
