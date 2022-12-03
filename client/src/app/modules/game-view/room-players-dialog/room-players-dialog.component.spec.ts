import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomPlayersDialogComponent } from './room-players-dialog.component';

describe('RoomPlayersDialogComponent', () => {
  let component: RoomPlayersDialogComponent;
  let fixture: ComponentFixture<RoomPlayersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomPlayersDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomPlayersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
