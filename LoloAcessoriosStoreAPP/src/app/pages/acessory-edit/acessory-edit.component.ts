import { Component, inject, Input, OnInit } from '@angular/core';
import { AcessoryService } from '../../core/services/acessory.service';
import { AcessoryDTO, CreateAcessoryDTO } from '../../core/interfaces/acessory.models';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FormAcessoryComponent } from "../../shared/components/form-acessory/form-acessory.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { extractErrors } from '../../shared/functions/extractErrors';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acessory-edit',
  imports: [HeaderComponent, FormAcessoryComponent, FooterComponent],
  templateUrl: './acessory-edit.component.html',
  styleUrl: './acessory-edit.component.scss'
})
export class AcessoryEditComponent implements OnInit {
  private acessoryService = inject(AcessoryService);
  private router = inject(Router);

  @Input()
  id!: number;


  acessoryModel!: AcessoryDTO;
  creation: boolean = false;
  errors: string[] = []

  ngOnInit() {
    this.acessoryService.getAcessoryById(this.id).subscribe((acessory) => {
      this.acessoryModel = acessory;
    })
  }

  onSubmit(dto: CreateAcessoryDTO) {
    this.acessoryService.updateAcessory(this.id, dto).subscribe({
      next: () => {
        this.router.navigate(['/acessories'])
      },
      error: err => {
        this.errors = extractErrors(err);
      }
    });
  }

}
