import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UpdateOwnProfileDTO, UpdateProfileDTO, UserProfileDTO } from '../../../core/interfaces/user.models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { matchValidator } from '../../functions/matchValidator';
import { DisplayErrorsComponent } from "../display-errors/display-errors.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-form-edit-user',
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatSlideToggleModule, MatFormFieldModule, DisplayErrorsComponent, RouterLink],
  templateUrl: './form-edit-user.component.html',
  styleUrl: './form-edit-user.component.scss'
})
export class FormEditUserComponent implements OnInit {
  @Input()
  model!: UserProfileDTO

  @Input()
  isAdmin!: boolean;

  @Input()
  errors!: string[];

  @Output()
  userFormAdmin = new EventEmitter<UpdateProfileDTO>();

  @Output()
  userForm = new EventEmitter<UpdateOwnProfileDTO>();

  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    name: ['', [Validators.required]],
    dateOfBirth: new FormControl<string | null>(null),
    email: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    currentPassword: [''],
    newPassword: [''],
    rePassword: [''],
  });

  menu: string = 'personal';

  ngOnInit() {
    this.form.patchValue({
      name: this.model.name,
      email: this.model.email,
      gender: this.model.gender,
      dateOfBirth: this.formatDate(this.model.dateOfBirth)
    });

    this.form.setValidators(matchValidator('newPassword', 'rePassword'));

    if (!this.isAdmin) {
      this.form.controls.newPassword.valueChanges.subscribe(newPasswordValue => {
        const currentPasswordControl = this.form.controls.currentPassword;

        if (newPasswordValue)
          currentPasswordControl.addValidators(Validators.required);

        else
          currentPasswordControl.removeValidators(Validators.required);

        currentPasswordControl.updateValueAndValidity();
      });
    }
  }

  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  changeMenu(menuType: string): void {
    this.menu = menuType;
  }

  saveChanges() {
    if (this.form.valid) {
      const dto: UpdateProfileDTO = {
        name: this.form.value.name!,
        email: this.form.value.email!,
        gender: this.form.value.gender!,
        dateOfBirth: new Date(this.form.value.dateOfBirth!),
        newPassword: this.form.value.newPassword!,
        rePassword: this.form.value.rePassword!
      };

      if (this.isAdmin)
        this.userFormAdmin.emit(dto);
      else {
        const ownDto: UpdateOwnProfileDTO = {
          ...dto,
          currentPassword: this.form.value.currentPassword!
        };
        this.userForm.emit(ownDto);
      }
    }
  }

  getErrorMessagesForName(): string {
    let field = this.form.controls.name;

    if(field.hasError('required'))
      return 'O nome é obrigatório';

    return '';
  }

  getErrorMessagesForGender(): string {
    let field = this.form.controls.gender;

    if(field.hasError('required'))
      return 'O gênero é obrigatório';

    return '';
  }

  getErrorMessagesForEmail(): string {
    let field = this.form.controls.email;

    if(field.hasError('required'))
      return 'O e-mail é obrigatório';

    if(field.hasError('email'))
      return 'E-mail inválido';

    return '';
  }

  getErrorMessagesForPassword(): string {
    let field = this.form.controls.currentPassword;

    if(field.hasError('required'))
      return 'Digite a sua senha atual';

    return '';
  }

  getErrorMessagesForConfirmPassword(): string {
    let field = this.form.controls.rePassword;

    if(field.hasError('mustMatch'))
      return 'As senhas devem coincidir';

    return '';
  }

}
