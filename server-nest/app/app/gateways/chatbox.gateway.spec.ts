import { Test, TestingModule } from '@nestjs/testing';
import { ChatboxGateway } from './chatbox.gateway';

describe('ChatboxGateway', () => {
  let gateway: ChatboxGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatboxGateway],
    }).compile();

    gateway = module.get<ChatboxGateway>(ChatboxGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
