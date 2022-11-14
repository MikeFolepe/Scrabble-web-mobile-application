import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoiningConfirmationDialogComponent } from './joining-confirmation-dialog.component';

describe('JoiningConfirmationDialogComponent', () => {
    let component: JoiningConfirmationDialogComponent;
    let fixture: ComponentFixture<JoiningConfirmationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoiningConfirmationDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoiningConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
