import { Component, inject } from '@angular/core';
import { AcessoryService } from '../../core/services/acessory.service';
import { AcessoryDTO } from '../../core/interfaces/acessory.models';
import { PaginationDTO } from '../../core/interfaces/paginationDTO';
import { HttpResponse } from '@angular/common/http';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { PaginationComponent } from "../../shared/components/pagination/pagination.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { DialogComponent } from "../../shared/components/dialog/dialog.component";

@Component({
  selector: 'app-acessory-list',
  imports: [HeaderComponent, MatButtonModule, MatIconModule, RouterLink, DecimalPipe, PaginationComponent, FooterComponent, DialogComponent],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  templateUrl: './acessory-list.component.html',
  styleUrl: './acessory-list.component.scss'
})
export class AcessoryListComponent {
  private acessoryService = inject(AcessoryService);
  acessoryList!: AcessoryDTO[];
  acessoryName!: string;
  pagination: PaginationDTO = {page: 1, recordsPerPage: 12};
  showModal: boolean = false;
  deleteIdToConfirm: number | null = null;

  constructor() {
    this.getAcessories();
  }

  getAcessories() {
    this.acessoryService.getLanding(this.pagination).subscribe((response: HttpResponse<AcessoryDTO[]>) => {
      this.acessoryList = response.body as AcessoryDTO[];
      const header = response.headers.get('total-records-count') as string;
      const total = parseInt(header, 10);

      this.pagination.totalRecords = total;
    });
  }

  getAcessoryById(id: number) {
    this.acessoryService.getAcessoryById(id).subscribe((response) => {
      this.acessoryName = response.name;
    });
  }

  onPageChange(newPage: number) {
    this.pagination.page = newPage;
    this.getAcessories();
  }

  askDelete(id: number) {
    this.getAcessoryById(id);
    this.deleteIdToConfirm = id;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  delete() {
    if(this.deleteIdToConfirm !== null)
      this.acessoryService.deleteAcessory(this.deleteIdToConfirm).subscribe(() => {
        this.resetModal();
        this.getAcessories();
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
