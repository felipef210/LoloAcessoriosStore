import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input()
  currentPage!: number;

  @Input()
  recordsPerPage!: number;

  @Input()
  totalRecords!: number;

  @Output()
  pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.recordsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  firstPage() {
    this.pageChange.emit(1);
  }

  lastPage() {
    this.pageChange.emit(this.totalPages);
  }
}
