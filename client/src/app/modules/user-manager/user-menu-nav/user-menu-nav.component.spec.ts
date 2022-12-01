import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMenuNavComponent } from './user-menu-nav.component';

describe('UserMenuNavComponent', () => {
    let component: UserMenuNavComponent;
    let fixture: ComponentFixture<UserMenuNavComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserMenuNavComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserMenuNavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
