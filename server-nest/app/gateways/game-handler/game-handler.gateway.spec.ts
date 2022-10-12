import { Test, TestingModule } from '@nestjs/testing';
import { GameHandlerGateway } from './game-handler.gateway';

describe('GameHandlerGateway', () => {
  let gateway: GameHandlerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameHandlerGateway],
    }).compile();

    gateway = module.get<GameHandlerGateway>(GameHandlerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
