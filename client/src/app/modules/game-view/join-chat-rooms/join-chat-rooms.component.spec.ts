import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinChatRoomsComponent } from './join-chat-rooms.component';

describe('JoinChatRoomsComponent', () => {
  let component: JoinChatRoomsComponent;
  let fixture: ComponentFixture<JoinChatRoomsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinChatRoomsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinChatRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
