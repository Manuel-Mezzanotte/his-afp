import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SystemStatus } from '../../core/SystemStatus/system-status';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

@Component({
  selector: 'his-stato-api',
  imports: [Button, DecimalPipe, Tag],
  templateUrl: 'stato-api.html',
  styleUrl: './stato-api.scss',
})
export class StatoAPI {
  readonly systemStatus = inject(SystemStatus);
}
