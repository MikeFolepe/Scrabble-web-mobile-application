import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeChatRoomComponent } from './t-room.component';

describe('ChangeChatRoomComponent', () => {
    let component: ChangeChatRoomComponent;
    let fixture: ComponentFixture<ChangeChatRoomComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChangeChatRoomComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChangeChatRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
