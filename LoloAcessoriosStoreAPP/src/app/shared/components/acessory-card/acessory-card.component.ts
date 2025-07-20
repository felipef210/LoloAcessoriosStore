import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthorizedComponent } from "../../security/authorized/authorized.component";
import { AcessoryService } from '../../../core/services/acessory.service';
import { DialogComponent } from "../dialog/dialog.component";

registerLocaleData(localePt);


@Component({
  selector: 'app-acessory-card',
  imports: [MatButtonModule, MatCardModule, DecimalPipe, MatIconModule, RouterLink, AuthorizedComponent, DialogComponent],
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

  @Input()
  cardId!: number;

  @Output()
  reload = new EventEmitter<void>();


  private acessoryService = inject(AcessoryService);

  showModal: boolean = false;
  deleteIdToConfirm: number | null = null;

  askDelete(id: number) {
    this.deleteIdToConfirm = id;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  delete() {
    if(this.deleteIdToConfirm !== null)
      this.acessoryService.deleteAcessory(this.deleteIdToConfirm).subscribe(() => {
        this.resetModal();
        this.reload.emit();
      });
  }

  cancelDelete() {
    this.resetModal();
  }

  resetModal() {
    this.showModal = false;
    this.deleteIdToConfirm = null;
    document.body.style.overflow = '';
  }
}
