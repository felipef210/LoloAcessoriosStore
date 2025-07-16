import { Component, inject, Input, numberAttribute, OnInit } from '@angular/core';
import { AcessoryDTO } from '../../core/interfaces/acessory.models';
import { AcessoryService } from '../../core/services/acessory.service';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

@Component({
  selector: 'app-acessory-details',
  imports: [HeaderComponent, FooterComponent, MatButtonModule, MatIconModule, RouterLink, DecimalPipe],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  templateUrl: './acessory-details.component.html',
  styleUrl: './acessory-details.component.scss'
})
export class AcessoryDetailsComponent implements OnInit {
  @Input({transform: numberAttribute})
  id!: number;

  acessory!: AcessoryDTO;
  mainPicture!: string;
  indexSelecionado = 0;

  private acessoryService = inject(AcessoryService);

  ngOnInit(): void {
    this.acessoryService.getAcessoryById(this.id).subscribe((acessory) => {
      this.acessory = acessory;
      this.mainPicture = acessory.pictures[0];
    });
  }

  changeMainPicture(index: number) {
    this.indexSelecionado = index
    this.mainPicture = this.acessory.pictures[index];
  }
}
