import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FilterAcessoryDTO } from '../../../core/interfaces/acessory.models';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-search',
  imports: [ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  categories: string[] = ['Todos os produtos', 'Anéis', 'Braceletes', 'Brincos', 'Colares', 'Pulseiras'];
  categoriesFilter: string [] = ['Todos os produtos', 'Anel', 'Bracelete', 'Brinco', 'Colar', 'Pulseira'];
  private fb = inject(FormBuilder);

  @Output()
  formChanged = new EventEmitter<FilterAcessoryDTO>();

  form = this.fb.group({
    search: [''],
    filterBy: [''],
    selectedCategory: [this.categories[0]]
  });

  constructor() {
    this.form.valueChanges.pipe(debounceTime(500)).subscribe(values => {
      const selectedIndex = this.categories.indexOf(values.selectedCategory ?? '');
      const singularCategory = this.categoriesFilter[selectedIndex] ?? '';

      this.formChanged.emit({
        name: values.search ?? '',
        orderBy: values.filterBy ?? '',
        category: singularCategory,
        page: 1,
        recordsPerPage: 12
      });
    });
  }

  selectCategory(category: string) {
    this.form.controls.selectedCategory.setValue(category);
  }
}
