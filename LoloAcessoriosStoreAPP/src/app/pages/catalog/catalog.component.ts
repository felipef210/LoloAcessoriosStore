import { AcessoryDTO, FilterAcessoryDTO } from './../../core/interfaces/acessory.models';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { SearchComponent } from "../../shared/components/search/search.component";
import { AcessoryService } from '../../core/services/acessory.service';
import { AcessoryCardComponent } from '../../shared/components/acessory-card/acessory-card.component';

@Component({
  selector: 'app-catalog',
  imports: [HeaderComponent, SearchComponent, AcessoryCardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {
  acessoryList!: AcessoryDTO[];
  pages: number[] = [];
  currentPage: number = 1;
  itemsPerPage = 12;

  acessoryService = inject(AcessoryService);

  constructor() {
    this.getAcessories();

  }

  filter(values: FilterAcessoryDTO) {
    this.acessoryService.filter(values).subscribe((response) => {
      this.acessoryList = response;
    });
  }

  getAcessories(page: number = this.currentPage) {
    this.acessoryService.getLanding(page).subscribe((response) => {
      this.acessoryList = response.items;
      this.currentPage = page;

      const totalPages = Math.ceil(response.totalItems / this.itemsPerPage);
      this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    });
  }

  goToPage(page: number) {
    this.getAcessories(page);
  }

  previousPage() {
    if(this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.getAcessories();
    }

    return;
  }

  nextPage() {
    if(this.currentPage < this.pages[this.pages.length - 1]) {
      this.currentPage = this.currentPage + 1;
      this.getAcessories();
    }

    return;
  }

  firstPage() {
    this.currentPage = 1;
    this.getAcessories();
  }

  lastPage() {
    this.currentPage = this.pages[this.pages.length - 1];
    this.getAcessories();
  }
}
