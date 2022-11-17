import { TestBed } from '@angular/core/testing';

import { JoinRomService } from './join-rom.service';

describe('JoinRomService', () => {
  let service: JoinRomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JoinRomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
