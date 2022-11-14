import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordGameDialogComponent } from './password-game-dialog.component';

describe('PasswordGameDialogComponent', () => {
    let component: PasswordGameDialogComponent;
    let fixture: ComponentFixture<PasswordGameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PasswordGameDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PasswordGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
