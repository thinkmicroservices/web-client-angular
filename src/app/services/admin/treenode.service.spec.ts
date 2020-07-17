import { TestBed } from '@angular/core/testing';

import { TreenodeService } from './treenode.service';

describe('TreenodeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TreenodeService = TestBed.get(TreenodeService);
    expect(service).toBeTruthy();
  });
});
