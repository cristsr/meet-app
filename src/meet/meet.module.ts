import { Module } from '@nestjs/common';
import { MeetController } from 'meet/controllers';
import { MeetGateway } from 'meet/gateways';
import { MeetService } from 'meet/services';
import { MeetRepository } from 'meet/repositories';

@Module({
  controllers: [MeetController],
  providers: [MeetService, MeetGateway, MeetRepository],
})
export class MeetModule {}
