import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { StaffManager } from '../../core/Staff/staff-manager';
import { staffRoleLabels } from '../../core/Staff/staff.model';

@Component({
  selector: 'his-gestione-personale',
  imports: [Button, TagModule],
  templateUrl: './gestione-personale.html',
  styleUrl: './gestione-personale.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionePersonale {
  readonly staffManager = inject(StaffManager);
  readonly roleLabels = staffRoleLabels;

  constructor() {
    this.staffManager.fetchStaff();
  }
}
