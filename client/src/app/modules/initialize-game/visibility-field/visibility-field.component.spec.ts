import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisibilityFieldComponent } from './visibility-field.component';

describe('VisibilityFieldComponent', () => {
    let component: VisibilityFieldComponent;
    let fixture: ComponentFixture<VisibilityFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VisibilityFieldComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VisibilityFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
