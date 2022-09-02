/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { EASEL_SIZE, RESERVE } from '@app/classes/constants';
import { Letter } from '@common/letter';
import { LetterService } from './letter.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';

describe('LetterService', () => {
    let service: LetterService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [LetterService], imports: [HttpClientTestingModule, RouterTestingModule] });
        service = TestBed.inject(LetterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should returns a letter', () => {
        const letter = service.getRandomLetter();
        expect(letter).toBeInstanceOf(Object);
        expect(letter).toBeDefined();
    });

    it('should add a letter to the reserve', () => {
        const letterTest = service.reserve[0].value;
        const initialSize = service.reserveSize;
        service.addLetterToReserve(letterTest);
        expect(service.reserveSize).toEqual(initialSize + 1);
    });

    it('should not add a letter to the reserve if this one does not exists', () => {
        const initialSize = service.reserveSize;
        const letterTest = '-';
        service.addLetterToReserve(letterTest);
        expect(service.reserveSize).toEqual(initialSize);
    });

    it('should returns enough letters to fill the easel', () => {
        const letters = service.getRandomLetters();
        expect(letters).toBeInstanceOf(Object);
        expect(letters).toBeDefined();
        expect(letters).toHaveSize(EASEL_SIZE);
    });

    it('should return an empty letter when getRandomLetter() is called and reserve is empty', () => {
        service.reserve = [];
        service.reserveSize = 0;
        const letterEmpty: Letter = {
            value: '',
            quantity: 0,
            points: 0,
            isSelectedForSwap: false,
            isSelectedForManipulation: false,
        };
        expect(service.getRandomLetter()).toEqual(letterEmpty);
    });

    it('removing letters from the reserve should update the size', () => {
        const letterA = service.reserve[0];
        const letterB = service.reserve[1];
        const letterC = service.reserve[2];
        const letterD = service.reserve[3];
        const letterE = service.reserve[4];
        const lettersToRemove: Letter[] = [letterA, letterB, letterC, letterD, letterE, letterE];
        const initialSize = service.reserveSize;
        service.removeLettersFromReserve(lettersToRemove);
        expect(service.reserveSize).toEqual(initialSize - lettersToRemove.length);
    });

    it('the emit receiveRoomMessage should call sendOpponentMessage', () => {
        service['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (reserve: Letter[], reserveSize: number) => void) => {
                if (eventName === 'receiveReserve') {
                    callback(RESERVE, 100);
                }
            },
        } as unknown as Socket;
        service.receiveReserve();
        expect(service.reserve).toEqual(RESERVE);
        expect(service.reserveSize).toEqual(100);
    });
});
