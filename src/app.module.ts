import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { validate } from 'environment';
import { MeetModule } from 'meet/meet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
    }),
    MeetModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
