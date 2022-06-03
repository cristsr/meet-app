import { Module } from '@nestjs/common';
import { MeetGateway } from 'meet/gateways';
import { MeetRepository } from 'meet/repositories';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [MeetGateway, MeetRepository],
})
export class MeetModule {}
