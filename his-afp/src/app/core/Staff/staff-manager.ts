import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { APIResponse } from '../models/APIResponse.model';
import {
  CreatedStaffUser,
  CreateStaffUser,
  StaffRole,
  StaffRoleUpdateResponse,
  StaffUser,
  UpdateStaffRole,
  UsernameAvailability,
} from './staff.model';

@Injectable({
  providedIn: 'root',
})
export class StaffManager {
  readonly #http = inject(HttpClient);
  readonly #staff = signal<StaffUser[]>([]);
  readonly #loading = signal<boolean>(false);
  readonly #error = signal<string | null>(null);

  staff = this.#staff.asReadonly();
  loading = this.#loading.asReadonly();
  error = this.#error.asReadonly();

  public fetchStaff(): void {
    this.#loading.set(true);
    this.#error.set(null);

    this.#http.get<APIResponse<StaffUser[]>>('/api/users').subscribe({
      next: (res) => {
        this.#staff.set(res.data);
        this.#loading.set(false);
      },
      error: () => {
        this.#error.set('Errore durante il caricamento dello staff');
        this.#loading.set(false);
      },
    });
  }

  public checkUsernameAvailability(username: string): Observable<boolean> {
    return this.#http
      .get<APIResponse<UsernameAvailability>>(`/api/users/check/${encodeURIComponent(username)}`)
      .pipe(map((res) => res.data.available));
  }

  public createUser(payload: CreateStaffUser): Observable<StaffUser> {
    return this.#http.post<APIResponse<CreatedStaffUser>>('/api/users', payload).pipe(
      map((res) => ({ ...res.data, isActive: true })),
      tap((user) => {
        this.#staff.update((staff) =>
          [...staff, user].sort((a, b) => a.username.localeCompare(b.username)),
        );
      }),
    );
  }

  public updateRole(id: number, role: StaffRole): Observable<StaffRoleUpdateResponse> {
    const payload: UpdateStaffRole = { role };

    return this.#http.patch<APIResponse<StaffRoleUpdateResponse>>(`/api/users/${id}/editrole`, payload).pipe(
      map((res) => res.data),
      tap((updatedUser) => {
        this.#staff.update((staff) =>
          staff.map((user) =>
            user.id === updatedUser.id ? { ...user, role: updatedUser.role } : user,
          ),
        );
      }),
    );
  }
}
