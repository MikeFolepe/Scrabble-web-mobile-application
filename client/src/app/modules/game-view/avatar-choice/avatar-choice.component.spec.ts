import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarChoiceComponent } from './avatar-choice.component';

describe('AvatarChoiceComponent', () => {
    let component: AvatarChoiceComponent;
    let fixture: ComponentFixture<AvatarChoiceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AvatarChoiceComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AvatarChoiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
