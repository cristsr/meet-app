import { Test, TestingModule } from '@nestjs/testing';
import { MeetRepository } from './meet.repository';

describe('MeetService', () => {
  let service: MeetRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetRepository],
    }).compile();

    service = module.get<MeetRepository>(MeetRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
