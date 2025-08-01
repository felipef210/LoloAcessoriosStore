import { UpdateProfileDTO } from './../../core/interfaces/user.models';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FormEditUserComponent } from "../../shared/components/form-edit-user/form-edit-user.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { UserProfileDTO } from '../../core/interfaces/user.models';
import { SecurityService } from '../../core/services/security.service';
import { ActivatedRoute, Router } from '@angular/router';
import { extractErrors, extractErrorsIdentity } from '../../shared/functions/extractErrors';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-profile-as-admin',
  imports: [HeaderComponent, FormEditUserComponent, FooterComponent],
  templateUrl: './edit-profile-as-admin.component.html',
  styleUrl: './edit-profile-as-admin.component.scss'
})
export class EditProfileAsAdminComponent {
  model!: UserProfileDTO;

  errors!: string[];

  private securityService = inject(SecurityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.loadProfile();
  }

  loadProfile() {
    const email = this.route.snapshot.paramMap.get('email');

    if (email)
      this.securityService.getUserByEmail(email).subscribe((response) => {
        this.model = response;
      });
  }

  saveChanges(dto: UpdateProfileDTO) {
    console.log('Dados recebidos:', dto);
    const email = this.route.snapshot.paramMap.get('email');
    this.securityService.updateProfile(email!, dto).subscribe({
      next: () => {
        Swal.fire('Sucesso', `Perfil atualizado com sucesso`, 'success');
        this.router.navigate(['/']);
      },

      error: err => {
        this.errors = extractErrorsIdentity(err);
      }
    })
  }
}
