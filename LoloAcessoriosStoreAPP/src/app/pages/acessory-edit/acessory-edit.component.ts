import { Component, inject, Input, OnInit } from '@angular/core';
import { AcessoryService } from '../../core/services/acessory.service';
import { AcessoryDTO } from '../../core/interfaces/acessory.models';

@Component({
  selector: 'app-acessory-edit',
  imports: [],
  templateUrl: './acessory-edit.component.html',
  styleUrl: './acessory-edit.component.scss'
})
export class AcessoryEditComponent implements OnInit {
  private acessoryService = inject(AcessoryService);

  @Input()
  id!: number;

  acessoryModel!: AcessoryDTO;

  ngOnInit() {
    this.acessoryService.getAcessoryById(this.id).subscribe((acessory) => {
      this.acessoryModel = acessory;
    })
  }
}
