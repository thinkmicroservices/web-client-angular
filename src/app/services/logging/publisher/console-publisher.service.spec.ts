import { TestBed } from '@angular/core/testing';

import { ConsolePublisherService } from './console-publisher.service';

describe('ConsolePublisherService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConsolePublisherService = TestBed.get(ConsolePublisherService);
    expect(service).toBeTruthy();
  });
});
