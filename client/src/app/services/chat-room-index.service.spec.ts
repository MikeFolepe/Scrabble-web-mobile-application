import { TestBed } from '@angular/core/testing';

import { ChatRoomIndexService } from './chat-room-index.service';

describe('ChatRoomIndexService', () => {
  let service: ChatRoomIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatRoomIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
