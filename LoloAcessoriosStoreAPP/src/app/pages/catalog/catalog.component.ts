import { AcessoryDTO, FilterAcessoryDTO } from './../../core/interfaces/acessory.models';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { SearchComponent } from "../../shared/components/search/search.component";
import { AcessoryService } from '../../core/services/acessory.service';
import { AcessoryCardComponent } from '../../shared/components/acessory-card/acessory-card.component';
import { PaginationDTO } from '../../core/interfaces/paginationDTO';
import { HttpResponse } from '@angular/common/http';
import { PaginationComponent } from "../../shared/components/pagination/pagination.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-catalog',
  imports: [HeaderComponent, SearchComponent, AcessoryCardComponent, PaginationComponent, FooterComponent, MatProgressSpinnerModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {
  acessoryList!: AcessoryDTO[];
  filterValues!: FilterAcessoryDTO;
  pagination: PaginationDTO = {page: 1, recordsPerPage: 12};
  totalRecordsCount!: number;

  acessoryService = inject(AcessoryService);

  constructor() {
    this.getAcessories();

  }

  // When occur changes on filter fields this function is called. The mains reason is to always reset the page when some change happen.
  filter(values: FilterAcessoryDTO) {
    this.filterValues = values;
    this.pagination.page = 1;
    this.loadFilteredAcessories();
  }

  // This function actualy loads all the filtered content.
  loadFilteredAcessories() {
    this.acessoryService.filter(this.filterValues, this.pagination).subscribe((response) => {
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

  /*
    And then there is the main reason to exist 2 functions to load filtered content. The
    page can be changed when I come to this function, if I had all the code of both
    filter and loadFiltered functions the page would always be reseted to 1 and ignore
    the parameter "newPage" because it would conflict with "this.pagination.page = newPage"
    and "this.pagination.page = 1" from filter function.
  */

  onPageChange(newPage: number) {
    this.pagination.page = newPage;

    if (this.filterValues)
      this.loadFilteredAcessories();

    else
      this.getAcessories();
  }
}
