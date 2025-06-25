import { TestBed } from '@angular/core/testing';
import { FirebaseDatabaseService } from './firebase-database.service';

describe('FirebaseDatabaseService', () => {
  let service: FirebaseDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  [
    'createDocument',
    'readCollection',
    'readDocument',
    'updateDocument',
    'deleteDocument',
    'getConductores',
    'getTransportes',
    'getTiposCarga',
    'getTurnos',
    'getVueltas',
    'getLocales',
    'getGestiones',
    'getEstados',
    'getDespachos'
  ].forEach(fn => {
    it(`should have ${fn}()`, () => {
      expect((service as any)[fn]).toBeTruthy();
      expect(typeof (service as any)[fn]).toBe('function');
    });
  });
});