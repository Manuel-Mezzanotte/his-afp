import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from 'primeng/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DarkmodeSelector } from '../darkmode-selector/darkmode-selector.component';
import { environment } from '../../../environments/environment';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'his-header',
  imports: [Button, RouterLink, RouterLinkActive, DarkmodeSelector, TagModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  reparto = environment.reparto;
  struttura = environment.struttura;

  /**
   * vx.y.z - 20260413 P
   * vx.y.z P
   */

  type = (window as any).env?.type;
  version = (window as any).env?.version;
}
