import { Test, TestingModule } from '@nestjs/testing';
import { WordValidationService } from './word-validation.service';

describe('WordValidationService', () => {
    let service: WordValidationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WordValidationService],
        }).compile();

        service = module.get<WordValidationService>(WordValidationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

});
