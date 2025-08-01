import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { UpdateOwnProfileDTO, UserProfileDTO } from '../../core/interfaces/user.models';
import { SecurityService } from '../../core/services/security.service';
import { Router } from '@angular/router';
import { extractErrorsIdentity } from '../../shared/functions/extractErrors';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { FormEditUserComponent } from "../../shared/components/form-edit-user/form-edit-user.component";

@Component({
  selector: 'app-edit-profile',
  imports: [HeaderComponent, FooterComponent, SweetAlert2Module, FormEditUserComponent],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {
  model!: UserProfileDTO;
  errors: string[] = [];

  private securityService = inject(SecurityService);
  private router = inject(Router);

  constructor() {
    this.loadProfile();
  }

  loadProfile() {
    this.securityService.getOwnProfile().subscribe((response) => {
      this.model = response;
    });
  }

  saveChanges(dto: UpdateOwnProfileDTO) {
    this.securityService.updateOwnProfile(dto).subscribe({
      next: (newToken) => {
        Swal.fire('Sucesso', `Perfil atualizado com sucesso`, 'success');
        this.securityService.storeToken(newToken);
        this.router.navigate(['/']);
      },

      error: err => {
        this.errors = extractErrorsIdentity(err);
      }
    })
  }
}
