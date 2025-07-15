import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { MatIconModule } from '@angular/material/icon';

registerLocaleData(localePt);


@Component({
  selector: 'app-acessory-card',
  imports: [MatButtonModule, MatCardModule, DecimalPipe, MatIconModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  templateUrl: './acessory-card.component.html',
  styleUrl: './acessory-card.component.scss'
})
export class AcessoryCardComponent {
  @Input()
  cardImage!: string;

  @Input({required: true})
  cardName!: string;

  @Input()
  cardPrice!: number;
}
