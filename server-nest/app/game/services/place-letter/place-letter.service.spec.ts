import { Test, TestingModule } from '@nestjs/testing';
import { PlaceLetterService } from './place-letter.service';

describe('PlaceLetterService', () => {
  let service: PlaceLetterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceLetterService],
    }).compile();

    service = module.get<PlaceLetterService>(PlaceLetterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
