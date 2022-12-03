import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardThemeDialogComponent } from './board-theme-dialog.component';

describe('BoardThemeDialogComponent', () => {
  let component: BoardThemeDialogComponent;
  let fixture: ComponentFixture<BoardThemeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardThemeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardThemeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
