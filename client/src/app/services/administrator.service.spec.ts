/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { AdministratorService } from './administrator.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';

interface DictionaryTest {
    title: string;
    description: string;
    words: string[];
}

describe('AdministratorService', () => {
    let service: AdministratorService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule, MatDialogModule],
        }).compileComponents();
        service = TestBed.inject(AdministratorService);
        jasmine.clock().install();
        service.beginnerNames = [
            {
                _id: '1',
                aiName: 'Mister_Bucky',
                isDefault: true,
            },
            {
                _id: '2',
                aiName: 'Miss_Betty',
                isDefault: true,
            },
            {
                _id: '3',
                aiName: 'Mister_Samy',
                isDefault: true,
            },
        ];
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should select the respective file on file input', () => {
        const file: File = new File([], 'file.json');

        const fileList: FileList = {
            0: file,
            length: 1,
            item: () => {
                return file;
            },
        };
        service.onFileInput(fileList as FileList | null);
        expect(service.file).toEqual(fileList.item(0));
    });

    it('isDictionaryValid() should return false when the file is not a .json', async () => {
        service.file = new File([], 'file');
        const isValid: boolean = await service.isDictionaryValid();
        expect(isValid).toBeFalse();
    });

    it('isDictionaryValid() should return false on an invalid dictionary', async () => {
        const blob = new Blob([], { type: 'application/json' });
        service.file = new File([blob], 'file.json', { type: 'application/json' });
        const isValid: boolean = await service.isDictionaryValid();
        expect(isValid).toBeFalse();
    });

    it('isDictionaryValid() should return true on a valid dictionary', async () => {
        const dictionary: DictionaryTest = { title: 'Un dictionnaire', description: 'Une description', words: ['a', 'b', 'c'] };
        const jsn = JSON.stringify(dictionary);
        const blob = new Blob([jsn], { type: 'application/json' });
        service.file = new File([blob], 'file.json', { type: 'application/json' });
        const isValid: boolean = await service.isDictionaryValid();
        expect(isValid).toBeTrue();
    });

    it('adding a dictionary with a new name should be added to the dictionaries', () => {
        const message: Observable<string> = of('Uploaded');
        spyOn(service['communicationService'], 'uploadFile').and.returnValue(message);
        service.currentDictionary = { fileName: 'test', title: 'Un dictionnaire', description: 'Une description', isDefault: false };
        service.file = new File([], 'test', { type: 'application/json' });
        service.addDictionary();
        expect(service.dictionaries[0].fileName).toEqual('test');
    });

    it('adding a dictionary while its name already exist should not be possible', () => {
        spyOn<any>(service, 'displayUploadMessage').and.callThrough();
        const message: Observable<string> = of('Uploaded');
        spyOn(service['communicationService'], 'uploadFile').and.returnValue(message);
        service.currentDictionary = { fileName: 'test', title: 'Un dictionnaire', description: 'Une description', isDefault: false };
        service.file = new File([], 'test', { type: 'application/json' });
        service.dictionaries = [service.currentDictionary];
        service.addDictionary();
        jasmine.clock().tick(3000);
        expect(service['displayUploadMessage']).toHaveBeenCalledWith('Il existe déjà un dictionnaire portant le même nom');
    });

    it('submiting a valid dictionary should call addDictionary()', async () => {
        spyOn(service, 'isDictionaryValid').and.returnValue(Promise.resolve(true));
        spyOn(service, 'addDictionary');
        await service.onSubmit();
        expect(service.addDictionary).toHaveBeenCalled();
    });

    it('submiting a invalid dictionary should display the respective message', async () => {
        spyOn(service, 'isDictionaryValid').and.returnValue(Promise.resolve(false));
        spyOn<any>(service, 'displayUploadMessage');
        await service.onSubmit();
        expect(service['displayUploadMessage']).toHaveBeenCalledWith("Le fichier n'est pas un dictionnaire");
    });

    it('should return a random name of beginner Ai name', () => {
        service.getAiBeginnerName();
        expect(service.getAiBeginnerName()).not.toEqual('');
    });
});
