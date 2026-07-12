import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { StaffManager } from '../../core/Staff/staff-manager';
import {
  CreateStaffUser,
  StaffRole,
  StaffUser,
  staffRoleLabels,
} from '../../core/Staff/staff.model';

type StaffFormControl = 'username' | 'password' | 'role';

interface RoleOption {
  label: string;
  value: StaffRole;
}

@Component({
  selector: 'his-gestione-personale',
  imports: [Button, FormsModule, InputText, Message, ReactiveFormsModule, SelectModule, TagModule],
  templateUrl: './gestione-personale.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionePersonale {
  readonly staffManager = inject(StaffManager);
  readonly roleLabels = staffRoleLabels;
  readonly roleOptions: RoleOption[] = [
    { label: staffRoleLabels.DOC, value: 'DOC' },
    { label: staffRoleLabels.INF, value: 'INF' },
    { label: staffRoleLabels.AMM, value: 'AMM' },
  ];
  readonly saveError = signal<string | null>(null);
  readonly roleDrafts = signal<Record<number, StaffRole>>({});
  readonly savingRoleId = signal<number | null>(null);
  readonly roleSaveError = signal<string | null>(null);

  readonly #fb = inject(FormBuilder);
  readonly staffForm = this.#fb.nonNullable.group({
    username: [
      '',
      [Validators.required, Validators.minLength(3)],
      [this.usernameAvailableValidator()],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: this.#fb.nonNullable.control<StaffRole>('INF', [Validators.required]),
  });

  constructor() {
    this.staffManager.fetchStaff();
  }

  public fieldInvalid(controlName: StaffFormControl): boolean {
    const control = this.staffForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  public fieldError(controlName: StaffFormControl, error: string): boolean {
    return this.staffForm.controls[controlName].hasError(error);
  }

  public onSubmit(): void {
    this.saveError.set(null);

    if (this.staffForm.invalid || this.staffForm.pending) {
      this.staffForm.markAllAsTouched();
      return;
    }

    const formValue = this.staffForm.getRawValue();
    const payload: CreateStaffUser = {
      username: formValue.username.trim(),
      password: formValue.password,
      role: formValue.role,
    };

    this.staffManager.createUser(payload).subscribe({
      next: () => {
        this.resetForm();
      },
      error: () => {
        this.saveError.set("Errore durante l'inserimento del collaboratore");
      },
    });
  }

  public resetForm(): void {
    this.saveError.set(null);

    this.staffForm.reset({
      username: '',
      password: '',
      role: 'INF',
    });
  }

  public selectedRole(user: StaffUser): StaffRole {
    return this.roleDrafts()[user.id] ?? user.role;
  }

  public setSelectedRole(userId: number, role: StaffRole): void {
    this.roleSaveError.set(null);
    this.roleDrafts.update((drafts) => ({ ...drafts, [userId]: role }));
  }

  public roleChanged(user: StaffUser): boolean {
    return this.selectedRole(user) !== user.role;
  }

  public saveRole(user: StaffUser): void {
    const role = this.selectedRole(user);

    if (role === user.role) {
      return;
    }

    this.roleSaveError.set(null);
    this.savingRoleId.set(user.id);

    this.staffManager.updateRole(user.id, role).subscribe({
      next: () => {
        this.roleDrafts.update((drafts) => {
          const nextDrafts = { ...drafts };
          delete nextDrafts[user.id];
          return nextDrafts;
        });
        this.savingRoleId.set(null);
      },
      error: () => {
        this.roleSaveError.set('Errore durante la modifica del ruolo');
        this.savingRoleId.set(null);
      },
    });
  }

  private usernameAvailableValidator(): AsyncValidatorFn {
    return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      const username = control.value.trim();

      if (!username || username.length < 3) {
        return of(null);
      }

      return timer(300).pipe(
        switchMap(() => this.staffManager.checkUsernameAvailability(username)),
        map((available) => (available ? null : { usernameTaken: true })),
        catchError(() => of({ usernameCheckFailed: true })),
      );
    };
  }
}
