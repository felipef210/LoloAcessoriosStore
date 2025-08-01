import { Component, inject } from '@angular/core';
import { SecurityService } from '../../core/services/security.service';
import { UserProfileDTO } from '../../core/interfaces/user.models';
import { PaginationDTO } from '../../core/interfaces/paginationDTO';
import { HttpResponse } from '@angular/common/http';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { MatIconModule } from "@angular/material/icon";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { PaginationComponent } from "../../shared/components/pagination/pagination.component";
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';

type ModalAction = 'delete' | 'makeAdmin' | 'removeAdmin';

@Component({
  selector: 'app-user-list',
  imports: [HeaderComponent, MatIconModule, FooterComponent, PaginationComponent, RouterLink, MatButtonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})

export class UserListComponent {
  private userService = inject(SecurityService);
  userList!: UserProfileDTO[];
  userName!: string;
  pagination: PaginationDTO = {page: 1, recordsPerPage: 12};
  currentModalAction!: ModalAction;

  constructor() {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsersPaginated(this.pagination).subscribe((response: HttpResponse<UserProfileDTO[]>) => {
      this.userList = response.body as UserProfileDTO[];
      const header = response.headers.get('total-records-count') as string;
      const total = parseInt(header, 10);

      this.pagination.totalRecords = total;
    });
  }

  getUserByEmail(email: string) {
    this.userService.getUserByEmail(email).subscribe((response) => {
      this.userName = response.name;
    });
  }

  makeAdmin(email: string) {
    this.userService.makeAdmin(email).subscribe(() => {
      this.getUsers();
    })
  }

  removeAdmin(email: string) {
    this.userService.removeAdmin(email).subscribe(() => {
      this.getUsers();
    })
  }

  onPageChange(newPage: number) {
    this.pagination.page = newPage;
    this.getUsers();
  }

  openModal(email: string, action: ModalAction) {
    this.userService.getUserByEmail(email).subscribe((response) => {
      const firstName = response.name.split(' ')[0];

      switch (action) {
        case 'makeAdmin':
          this.currentModalAction = 'makeAdmin';
          Swal.fire({
            title: 'Confirmação',
            icon: 'warning',
            text: 'Deseja tornar o usuário ' + `''` + firstName + `'' um administrador?`,
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
            customClass: {
              confirmButton: 'dialog-btn-confirm',
              cancelButton: 'dialog-btn-cancel'
            }
          }).then(response => {
            if (response.isConfirmed)
              this.makeAdmin(email);
          });
          break;

        case 'removeAdmin':
          this.currentModalAction = 'removeAdmin';
          Swal.fire({
            title: 'Confirmação',
            icon: 'question',
            text: 'Deseja remover o administrador do usuário ' + `''` + firstName + `''?`,
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
            customClass: {
              confirmButton: 'dialog-btn-confirm',
              cancelButton: 'dialog-btn-cancel'
            }
          }).then(response => {
            if (response.isConfirmed)
              this.removeAdmin(email);
          });
          break;
      }
    });
  }
}
