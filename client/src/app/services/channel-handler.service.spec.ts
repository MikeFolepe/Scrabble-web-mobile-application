import { TestBed } from '@angular/core/testing';

import { ChannelHandlerService } from './channel-handler.service';

describe('ChannelHandlerService', () => {
  let service: ChannelHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
