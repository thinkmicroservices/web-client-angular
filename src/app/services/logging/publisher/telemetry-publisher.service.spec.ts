import { TestBed } from '@angular/core/testing';

import { TelemetryPublisherService } from './telemetry-publisher.service';

describe('TelemetryPublisherService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TelemetryPublisherService = TestBed.get(TelemetryPublisherService);
    expect(service).toBeTruthy();
  });
});
