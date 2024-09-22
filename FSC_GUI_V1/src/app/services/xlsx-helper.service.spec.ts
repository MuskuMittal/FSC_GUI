import { TestBed } from '@angular/core/testing';

import { XlsxHelperService } from './xlsx-helper.service';

describe('XlsxHelperService', () => {
  let service: XlsxHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XlsxHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
