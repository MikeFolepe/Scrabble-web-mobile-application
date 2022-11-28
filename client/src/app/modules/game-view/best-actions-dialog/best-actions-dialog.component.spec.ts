import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestActionsDialogComponent } from './best-actions-dialog.component';

describe('BestActionsDialogComponent', () => {
  let component: BestActionsDialogComponent;
  let fixture: ComponentFixture<BestActionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BestActionsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BestActionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
