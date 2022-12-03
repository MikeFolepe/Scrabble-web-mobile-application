import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatroomThemeDialogComponent } from './chatroom-theme-dialog.component';

describe('ChatroomThemeDialogComponent', () => {
  let component: ChatroomThemeDialogComponent;
  let fixture: ComponentFixture<ChatroomThemeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatroomThemeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatroomThemeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
