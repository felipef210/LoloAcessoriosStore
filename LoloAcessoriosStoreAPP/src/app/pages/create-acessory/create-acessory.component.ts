import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { FormAcessoryComponent } from "../../shared/components/form-acessory/form-acessory.component";
import { AcessoryService } from '../../core/services/acessory.service';
import { CreateAcessoryDTO } from '../../core/interfaces/acessory.models';
import { Router } from '@angular/router';
import { extractErrors } from '../../shared/functions/extractErrors';

@Component({
  selector: 'app-create-acessory',
  imports: [HeaderComponent, FooterComponent, FormAcessoryComponent],
  templateUrl: './create-acessory.component.html',
  styleUrl: './create-acessory.component.scss'
})
export class CreateAcessoryComponent {
  creation: boolean = true;
  errors: string[] = [];

  private router = inject(Router);
  private acessoryService = inject(AcessoryService);

  onSubmit(dto: CreateAcessoryDTO) {
    this.acessoryService.createAcessory(dto).subscribe({
      next: () => {
        this.router.navigate(['/acessories']);
      },
      error: err => {
        this.errors = extractErrors(err);
      }
    });
  }
}
