import { TestBed } from '@angular/core/testing';

import { ChatMessageServiceService } from './chat-message-service.service';

describe('ChatMessageServiceService', () => {
  let service: ChatMessageServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatMessageServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
