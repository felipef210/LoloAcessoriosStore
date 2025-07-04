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

  acessoryService = inject(AcessoryService);

  constructor() {
    this.getAcessories();
  }

  filter(values: FilterAcessoryDTO) {
    this.acessoryService.filter(values).subscribe((response) => {
      this.acessoryList = response;
    });
  }

  getAcessories() {
    this.acessoryService.getLanding().subscribe((acessories) => {
      this.acessoryList = acessories;
    });
  }
}
