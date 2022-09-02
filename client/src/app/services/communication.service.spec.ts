/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { AiPlayer, AiPlayerDB, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { of } from 'rxjs';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    const aiPlayers: AiPlayerDB[] = [
        {
            _id: 'db1',
            aiName: ' Mike',
            isDefault: true,
        },
    ];

    const dictionaries: Dictionary[] = [
        {
            fileName: 'dictionary.json',
            title: 'Mon dictionnaire',
            description: 'le dictionnaire',
            isDefault: true,
        },
        {
            fileName: 'dictionary.text',
            title: 'Nouveau dictionnaire',
            description: 'nouveau',
            isDefault: false,
        },
    ];
    // let baseUrl: string;
    let httpClientSpy: jasmine.SpyObj<HttpClient>;
    const newPlayedWords: Map<string, string[]> = new Map<string, string[]>([['ma', ['H8', 'H9']]]);
    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'get', 'put', 'delete']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, HttpClientModule],
            providers: [{ provide: HttpClient, useValue: httpClientSpy }],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        // baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('should handle http error safely', () => {
    //     service.validationPost(newPlayedWords, dictionary).subscribe((response: boolean) => {
    //         expect(response).toBeUndefined();
    //     }, fail);
    //     const req = httpMock.expectOne(`${baseUrl}/game/validateWords`);
    //     expect(req.request.method).toBe('POST');
    //     req.error(new ErrorEvent('Random error occurred'));
    // });

    it('should return the result of a validation request', () => {
        httpClientSpy.post.and.returnValue(of(true));
        service.validationPost(newPlayedWords, 'dictionary.json').subscribe((validation) => {
            expect(validation).toEqual(true);
        });
        expect(service['wordsToValidate']).toEqual(['ma']);
        expect(httpClientSpy.post).toHaveBeenCalled();
    });

    it('should return the game dictionary from a valid get request ', () => {
        const dictionary = ['maman', 'papa', 'oufff'];
        httpClientSpy.get.and.returnValue(of(dictionary));
        service.getGameDictionary('dictionary.json').subscribe((dictionaryFromServer) => {
            expect(dictionaryFromServer).toEqual(dictionary);
        });
        expect(httpClientSpy.get).toHaveBeenCalled();
    });

    it('should return the game dictionary from a valid get request ', () => {
        const dictionary = ['maman', 'papa', 'oufff'];
        httpClientSpy.get.and.returnValue(of(dictionary));
        service.getGameDictionary('dictionary.json').subscribe((dictionaryFromServer) => {
            expect(dictionaryFromServer).toEqual(dictionary);
        });
        expect(httpClientSpy.get).toHaveBeenCalled();
    });

    it('should return the ai beginners from a valid get request ', () => {
        httpClientSpy.get.and.returnValue(of(aiPlayers));
        service.getAiPlayers(AiType.beginner).subscribe((beginnersFromServer) => {
            expect(beginnersFromServer).toEqual(aiPlayers);
        });
        expect(httpClientSpy.get).toHaveBeenCalled();
    });

    it('should return the ai beginners from a valid get request ', () => {
        httpClientSpy.get.and.returnValue(of(aiPlayers));
        service.getAiPlayers(AiType.expert).subscribe((expertsFromServer) => {
            expect(expertsFromServer).toEqual(aiPlayers);
        });
        expect(httpClientSpy.get).toHaveBeenCalled();
    });

    it('should return the added player', () => {
        const player: AiPlayer = {
            aiName: ' Mike',
            isDefault: true,
        };

        const expectedPlayer: AiPlayerDB = {
            _id: 'DB1',
            aiName: 'Mike',
            isDefault: false,
        };

        httpClientSpy.post.and.returnValue(of(expectedPlayer));
        service.addAiPlayer(player, AiType.beginner).subscribe((returnedPlayer) => {
            expect(returnedPlayer).toEqual(expectedPlayer);
        });
        expect(httpClientSpy.post).toHaveBeenCalled();
    });

    it('should return the new array of player after the delete request', () => {
        httpClientSpy.delete.and.returnValue(of(aiPlayers));
        service.deleteAiPlayer('player', AiType.beginner).subscribe((returnedPlayer) => {
            expect(returnedPlayer).toEqual(aiPlayers);
        });
        expect(httpClientSpy.delete).toHaveBeenCalled();
    });

    it('should return the new array of player after the delete request', () => {
        httpClientSpy.delete.and.returnValue(of(aiPlayers));
        service.deleteAiPlayer('player', AiType.expert).subscribe((returnedPlayer) => {
            expect(returnedPlayer).toEqual(aiPlayers);
        });
        expect(httpClientSpy.delete).toHaveBeenCalled();
    });

    it('should successfully execute de delete request asked by the admin to reset scores', () => {
        httpClientSpy.delete.and.returnValue(of());
        service.deleteScores().subscribe(() => {});
        expect(httpClientSpy.delete).toHaveBeenCalled();
    });

    it('should return the new array of player after the update request', () => {
        const player: AiPlayer = {
            aiName: ' Mike',
            isDefault: true,
        };

        httpClientSpy.put.and.returnValue(of(aiPlayers));
        service.updateAiPlayer('player', player, AiType.beginner).subscribe((returnedPlayer) => {
            expect(returnedPlayer).toEqual(aiPlayers);
        });
        expect(httpClientSpy.put).toHaveBeenCalled();
    });

    it('should confirm that the file has been uploaded', () => {
        httpClientSpy.post.and.returnValue(of('uploaded'));
        service.uploadFile(new File(['fichier'], 'text')).subscribe((confirmation) => {
            expect(confirmation).toEqual('uploaded');
        });
        expect(httpClientSpy.post).toHaveBeenCalled();
    });

    it('should return the dictionaries on the server ', () => {
        httpClientSpy.get.and.returnValue(of(dictionaries));
        service.getDictionaries().subscribe((resultDic) => {
            expect(resultDic).toEqual(dictionaries);
        });
        expect(httpClientSpy.get).toHaveBeenCalled();
    });

    it('should return the new array of dictionaries after update', () => {
        const dictionary: Dictionary = {
            fileName: 'dictionary.json',
            title: 'Mon dictionnaire',
            description: 'le dictionnaire',
            isDefault: true,
        };

        httpClientSpy.put.and.returnValue(of(dictionaries));
        service.updateDictionary(dictionary).subscribe((result) => {
            expect(result).toEqual(dictionaries);
        });
        expect(httpClientSpy.put).toHaveBeenCalled();
    });

    it('should successfully execute the delete request asked by the admin', () => {
        httpClientSpy.delete.and.returnValue(of(dictionaries));
        service.deleteDictionary('dictionary').subscribe((result) => {
            expect(result).toEqual(dictionaries);
        });
        expect(httpClientSpy.delete).toHaveBeenCalled();
    });

    it('should successfully execute the get request asked by the admin to download the dictionary', () => {
        httpClientSpy.get.and.returnValue(of({}));
        service.downloadDictionary('dictionary').subscribe((result) => {
            expect(result).toEqual({});
        });
        expect(httpClientSpy.get).toHaveBeenCalled();
    });
});
