import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Fieldset } from 'primeng/fieldset';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { PatientAdmission, PatientSearchResult } from '../../core/Pazienti/Pazienti.model';

@Component({
  selector: 'his-accettazione-pz',
  imports: [
    InputText,
    ReactiveFormsModule,
    Button,
    Message,
    DatePicker,
    SelectModule,
    Textarea,
    Fieldset,
  ],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);
  patientManager = inject(PatientManager);
  readonly selectedPatient = input<PatientSearchResult | null>(null);
  readonly newPatient = input<boolean>(false);

  readonly maxDate = new Date();
  readonly sexOption = [
    {
      code: 'M',
      desc: 'Maschio',
    },
    {
      code: 'F',
      desc: 'Femmina',
    },
  ];

  readonly #fb = inject(FormBuilder);
  paziente = this.#fb.group({
    anagrafica: this.#fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      dataNascita: [null as Date | null, [Validators.required]],
      codiceFiscale: [
        '',
        [Validators.required, Validators.pattern('[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]')],
        // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
      ],
      sesso: ['', [Validators.required]],
    }),
    sanitaria: this.#fb.group({
      patologia: ['', [Validators.required]],
      codiceColore: ['', [Validators.required]],
      modArrivo: ['', [Validators.required]],
      noteTriage: ['', [Validators.required, Validators.maxLength(500)]],
    }),
  });

  constructor() {
    effect(() => {
      const patient = this.selectedPatient();

      if (patient) {
        this.paziente.controls.anagrafica.patchValue({
          nome: patient.nome,
          cognome: patient.cognome,
          dataNascita: new Date(patient.dataNascita),
          codiceFiscale: patient.codiceFiscale,
          sesso: patient.sesso,
        });
      } else if (this.newPatient()) {
        this.paziente.controls.anagrafica.reset({
          nome: '',
          cognome: '',
          dataNascita: null,
          codiceFiscale: '',
          sesso: '',
        });
      }
    });
  }

  checkFormControl(control: string) {
    const fc = this.paziente.get(control);
    // nome.invalid && (nome.touched || nome.dirty)
    return fc?.invalid && (fc.touched || fc.dirty);
  }
  checkFormControlError(control: string, err: string) {
    const fc = this.paziente.get(control);

    if (fc && fc.hasError(err)) {
      return fc.getError(err);
    } else {
      return null;
    }
  }
  onSubmit() {
    if (this.paziente.valid) {
      const formValue = this.paziente.getRawValue();
      const dataNascita = formValue.anagrafica.dataNascita;

      if (!dataNascita) {
        return;
      }

      const payload: PatientAdmission = {
        anagrafica: {
          nome: formValue.anagrafica.nome ?? '',
          cognome: formValue.anagrafica.cognome ?? '',
          dataNascita: this.formatDate(dataNascita),
          codiceFiscale: formValue.anagrafica.codiceFiscale ?? '',
          sesso: formValue.anagrafica.sesso ?? '',
        },
        sanitaria: {
          patologia: formValue.sanitaria.patologia ?? '',
          codiceColore: formValue.sanitaria.codiceColore ?? '',
          modArrivo: formValue.sanitaria.modArrivo ?? '',
          noteTriage: formValue.sanitaria.noteTriage ?? '',
        },
      };

      this.patientManager.admitPatient(payload);
    } else {
      this.paziente.markAllAsTouched();
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
