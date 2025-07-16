import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rating',
  imports: [MatIconModule, NgClass],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class RatingComponent implements OnInit {
  @Input({required: true, transform: (value: number) => Array(value).fill(0)})
  maxRating!: number[];

  @Input()
  selectedRating: number = 0;

  @Output()
  rated = new EventEmitter<number>();

  clickedRating: number = 0

  ngOnInit() {
    this.clickedRating = this.selectedRating;
  }

  handleMouseEnter(index: number) {
    this.selectedRating = index + 1;
  }

  handleMouseLeave() {
    if(this.clickedRating !== 0)
      this.selectedRating = this.clickedRating;

    else
      this.selectedRating = 0;
  }

  handleClick(index: number) {
    const clickedValue = index + 1;

    if (this.clickedRating === clickedValue) {
      // Se clicou na mesma estrela, zera
      this.clickedRating = 0;
      this.rated.emit(clickedValue);
    }
    else {
      // Se clicou em uma nova estrela, atualiza
      this.clickedRating = clickedValue;
      this.rated.emit(clickedValue);
    }
  }
}
