import { Test, TestingModule } from '@nestjs/testing';
import { Chats2Service } from './chats_2.service';

describe('Chats2Service', () => {
  let service: Chats2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Chats2Service],
    }).compile();

    service = module.get<Chats2Service>(Chats2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
