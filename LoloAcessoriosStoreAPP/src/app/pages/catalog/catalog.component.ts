import { AcessoryDTO, FilterAcessoryDTO } from './../../core/interfaces/acessory.models';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { SearchComponent } from "../../shared/components/search/search.component";
import { AcessoryService } from '../../core/services/acessory.service';
import { AcessoryCardComponent } from '../../shared/components/acessory-card/acessory-card.component';
import { PaginationDTO } from '../../core/interfaces/paginationDTO';
import { HttpResponse } from '@angular/common/http';
import { PaginationComponent } from "../../shared/components/pagination/pagination.component";

@Component({
  selector: 'app-catalog',
  imports: [HeaderComponent, SearchComponent, AcessoryCardComponent, PaginationComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {
  acessoryList!: AcessoryDTO[];
  lastFilterUsed?: FilterAcessoryDTO;
  pagination: PaginationDTO = {page: 1, recordsPerPage: 12};
  totalRecordsCount!: number;

  acessoryService = inject(AcessoryService);

  constructor() {
    this.getAcessories();

  }

  filter(values: FilterAcessoryDTO) {
    this.lastFilterUsed = values;
    values.page = this.pagination.page;
    values.recordsPerPage = this.pagination.recordsPerPage;

    this.acessoryService.filter(values).subscribe((response) => {
      this.acessoryList = response.body || [];

      const total = response.headers.get('total-records-count');
      this.pagination.totalRecords = total ? parseInt(total, 10) : 0;
    });
  }

  getAcessories() {
    this.acessoryService.getLanding(this.pagination).subscribe((response: HttpResponse<AcessoryDTO[]>) => {
      this.acessoryList = response.body as AcessoryDTO[];
      const header = response.headers.get('total-records-count') as string;
      const total = parseInt(header, 10);

      this.pagination.totalRecords = total;
    });
  }

  onPageChange(newPage: number) {
    this.pagination.page = newPage;

    if (this.lastFilterUsed)
      this.filter(this.lastFilterUsed);

    else
      this.getAcessories();
  }
}
