/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Dictionary } from '@common/dictionary';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let emptyDictionary: Dictionary;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {},
                },
                {
                    provide: MatSnackBar,
                    useValue: {},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        emptyDictionary = {
            fileName: 'empty.json',
            title: 'empty',
            description: 'empty dictionary',
            isDefault: false,
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should submit dictionary and reset file name field', () => {
        const submit = spyOn(component.adminService, 'onSubmit');
        component.onSubmitDictionary();
        expect(submit).toHaveBeenCalledTimes(1);
        expect(component.fileInput.nativeElement.value).toEqual('');
    });

    it('should cancel reset confirmation when cancelReset is called', () => {
        component.isResetConfirmation = true;
        component.cancelReset();
        expect(component.isResetConfirmation).toBeFalse();
    });

    it('should not change reset confirmation when cancelReset is called and reset confirmation is false', () => {
        component.isResetConfirmation = false;
        component.cancelReset();
        expect(component.isResetConfirmation).toBeFalse();
    });

    it('should not update dictionary if data fields are null', () => {
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(of(null));
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        component.dialog = matDialogMock;
        const updateDictionary = spyOn(component.adminService, 'updateDictionary');
        spyOn(component.adminService, 'isDictionaryDeletable').and.returnValue(true);
        component.editDictionary(emptyDictionary);
        expect(updateDictionary).not.toHaveBeenCalled();
    });

    it('should not update dictionary if at least one of the data field is null', () => {
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(
            of({
                title: 'dictionary.title',
                description: null,
            }),
        );
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        component.dialog = matDialogMock;
        const updateDictionary = spyOn(component.adminService, 'updateDictionary');
        spyOn(component.adminService, 'isDictionaryDeletable').and.returnValue(true);
        component.editDictionary(emptyDictionary);
        expect(updateDictionary).not.toHaveBeenCalled();
    });

    it('should not update dictionary if at least one of the data field not null', () => {
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(
            of({
                title: 'dictionary.title',
                description: 'dictionary.description',
            }),
        );
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        component.dialog = matDialogMock;
        const updateDictionary = spyOn(component.adminService, 'updateDictionary');
        spyOn(component.adminService, 'isDictionaryDeletable').and.returnValue(true);
        component.editDictionary(emptyDictionary);
        expect(updateDictionary).toHaveBeenCalled();
    });

    it('should not update dictionary if dictionary is default', () => {
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(
            of({
                title: 'dictionary.title',
                description: 'dictionary.description',
            }),
        );
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        component.dialog = matDialogMock;
        const updateDictionary = spyOn(component.adminService, 'updateDictionary');
        emptyDictionary.isDefault = true;
        spyOn(component.adminService, 'isDictionaryDeletable').and.returnValue(false);
        component.editDictionary(emptyDictionary);
        expect(updateDictionary).not.toHaveBeenCalled();
    });
});
