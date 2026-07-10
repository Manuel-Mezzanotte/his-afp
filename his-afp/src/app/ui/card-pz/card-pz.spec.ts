import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CardPz } from './card-pz';

describe('CardPz', () => {
  let component: CardPz;
  let fixture: ComponentFixture<CardPz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPz],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPz);
    fixture.componentRef.setInput('paziente', {
      id: '1',
      nome: 'Mario',
      cognome: 'Rossi',
      braccialetto: '2026-0001',
      eta: 46,
      codiceColore: 'VERDE',
      note: '',
      patologia: 'C19',
    });
    fixture.componentRef.setInput('borderTop', false);
    fixture.detectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
