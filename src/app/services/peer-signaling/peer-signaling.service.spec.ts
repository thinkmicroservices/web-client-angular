import { TestBed } from '@angular/core/testing';

import { PeerSignalingService } from './peer-signaling.service';

describe('PeerSignalingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PeerSignalingService = TestBed.get(PeerSignalingService);
    expect(service).toBeTruthy();
  });
});
