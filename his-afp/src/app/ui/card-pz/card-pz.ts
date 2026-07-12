import { Component, inject, input } from '@angular/core';
import { Button } from 'primeng/button';
import { Paziente } from '../../core/Pazienti/Pazienti.model';
import { Router } from '@angular/router';

@Component({
  selector: 'his-card-pz',
  imports: [Button],
  templateUrl: './card-pz.html',
  styleUrl: './card-pz.scss',
})
export class CardPz {
  paziente = input.required<Paziente>();
  borderTop = input.required<boolean>();
  readonly #router = inject(Router);

  public navigateToSchedaPaziente() {
    this.#router.navigate([`/modifica-pz/${this.paziente().id}`]);
  }

  setBorder() {
    return this.borderTop() ? 'triage-border-top' : 'triage-border-bottom';
  }

  setColoreDiStato() {
    switch (this.paziente().codiceColore) {
      case 'ROSSO':
        return 'triage-red';
      case 'ARANCIONE':
        return 'triage-orange';
      case 'AZZURRO':
        return 'triage-blue';
      case 'VERDE':
        return 'triage-green';
      case 'BIANCO':
        return 'triage-white';
      default:
        return '';
    }
  }
}
