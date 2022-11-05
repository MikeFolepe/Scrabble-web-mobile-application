import { Test, TestingModule } from '@nestjs/testing';
import { PlacementHandlerService } from './placement-handler.service';

describe('PlacementHandlerService', () => {
  let service: PlacementHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlacementHandlerService],
    }).compile();

    service = module.get<PlacementHandlerService>(PlacementHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
