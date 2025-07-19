import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FormComponent } from "../../shared/components/form/form.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { SecurityService } from '../../core/services/security.service';
import { Router } from '@angular/router';
import { CreateUserDTO } from '../../core/interfaces/user.models';
import { extractErrorsIdentity } from '../../shared/functions/extractErrors';

@Component({
  selector: 'app-register',
  imports: [HeaderComponent, FormComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  securityService = inject(SecurityService);
  router = inject(Router);
  errors: string[] = [];

  register(credentials: CreateUserDTO) {
      this.securityService.register(credentials).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },

        error: err => {
          this.errors = extractErrorsIdentity(err);
        }
      });
    }
}
