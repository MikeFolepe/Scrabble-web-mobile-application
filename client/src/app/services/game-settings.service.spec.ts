import { GameSettingsService } from '@app/services/game-settings.service';
import { TestBed } from '@angular/core/testing';

describe('GameSettingsService', () => {
    let service: GameSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameSettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('settings initialization should emit game settings', () => {
    //     const settings: GameSettings = new GameSettings(['player1', 'player2'], StartingPlayer.Player1, '00', '30', 'facile', false, 'français');
    //     service.initializeSettings(settings);
    //     expect(service.gameSettings).toEqual(settings);
    // });

    // it('settings getter should return right game settings', () => {
    //     service.gameSettings = new GameSettings(['player1', 'player2'], StartingPlayer.Player1, '02', '30', 'difficile', false, 'français');
    //     expect(service.getSettings()).toEqual(service.gameSettings);
    // });
});
