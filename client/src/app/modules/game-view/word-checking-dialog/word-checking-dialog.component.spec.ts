import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCheckingDialogComponent } from './word-checking-dialog.component';

describe('WordCheckingDialogComponent', () => {
  let component: WordCheckingDialogComponent;
  let fixture: ComponentFixture<WordCheckingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WordCheckingDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WordCheckingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
