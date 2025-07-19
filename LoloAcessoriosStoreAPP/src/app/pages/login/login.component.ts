import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FormComponent } from "../../shared/components/form/form.component";
import { extractErrorsIdentity } from '../../shared/functions/extractErrors';
import { SecurityService } from '../../core/services/security.service';
import { Router } from '@angular/router';
import { LoginDTO } from '../../core/interfaces/user.models';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent, FormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  securityService = inject(SecurityService);
  router = inject(Router);
  errors: string[] = [];

  login(credentials: LoginDTO) {
    this.securityService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },

      error: err => {
        this.errors = extractErrorsIdentity(err);
      }
    });
  }
}
