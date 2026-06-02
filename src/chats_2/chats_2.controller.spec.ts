import { Test, TestingModule } from '@nestjs/testing';
import { Chats2Controller } from './chats_2.controller';

describe('Chats2Controller', () => {
  let controller: Chats2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Chats2Controller],
    }).compile();

    controller = module.get<Chats2Controller>(Chats2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
