import { Component, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { matchValidator } from '../../functions/matchValidator';
import { RouterLink } from '@angular/router';
import { CreateUserDTO, LoginDTO, UpdateOwnProfileDTO, UpdateProfileDTO, UserProfileDTO } from '../../../core/interfaces/user.models';
import { DisplayErrorsComponent } from "../display-errors/display-errors.component";

@Component({
  selector: 'app-form',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatDatepickerModule, MatSelectModule, ReactiveFormsModule, MatButtonModule, RouterLink, DisplayErrorsComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class FormComponent {
  private formBuilder = inject(FormBuilder);

  @Input()
  isLogin!: boolean;

  @Input()
  isEditProfile!: boolean;

  @Input()
  title!: string;

  @Input()
  errors: string[] = [];

  @Input()
  model!: UserProfileDTO;

  @Output()
  loginForm = new EventEmitter<LoginDTO>();

  @Output()
  registerForm = new EventEmitter<CreateUserDTO>();

  form = this.formBuilder.group({
    name: [''],
    dateOfBirth: new FormControl<Date | null>(null),
    gender: [''],
    email: ['', {validators: [Validators.required, Validators.email]}],
    password: ['', {validators: [Validators.required]}],
    rePassword: ['', {validators: [Validators.required]}]
  });

  genderIcon: string = 'male';
  hide: boolean = true;
  hideConfirmPass: boolean = true;

  constructor() {
    this.form.controls.gender.valueChanges.subscribe(value => {
      this.updateGenderIcon(value);
    });
  }

  ngOnInit() {
    this.setConditionalValidators();

    if(this.model) {
      this.form.patchValue({
        name: this.model.name,
        dateOfBirth: this.model.dateOfBirth,
        gender: this.model.gender,
        email: this.model.email
      });
    }
  }

  private setConditionalValidators() {
    if (!this.isLogin) {
      this.form.controls.name.setValidators([Validators.required]);
      this.form.controls.dateOfBirth.setValidators([Validators.required]);
      this.form.controls.gender.setValidators([Validators.required]);
      this.form.controls.rePassword.setValidators([Validators.required]);

      // Verify if confirm password field match with password field.
      this.form.setValidators(matchValidator('password', 'rePassword'));
    }

    else {
      this.form.controls.name.setValidators(null);
      this.form.controls.dateOfBirth.setValidators(null);
      this.form.controls.gender.setValidators(null);
      this.form.controls.rePassword.setValidators(null);

      this.form.clearValidators();
    }

    // Update the state of the validation fields.
    Object.values(this.form.controls).forEach(control => control.updateValueAndValidity());
  }

  updateGenderIcon(value: string | null) {
    switch(value) {
      case 'Masculino':
        this.genderIcon = 'male';
        break;
      case 'Feminino':
        this.genderIcon = 'female';
        break;
      case 'Outro':
        this.genderIcon = 'diversity_3';
        break;
      default:
        this.genderIcon = 'male';
    }
  }

  getErrorMessagesForName(): string {
    let field = this.form.controls.name;

    if(field.hasError('required'))
      return 'O nome é obrigatório';

    return '';
  }

  getErrorMessagesForBirthDate(): string {
    let field = this.form.controls.dateOfBirth;

    if(field.hasError('required'))
      return 'Data de nascimento é obrigatória';

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
    let field = this.form.controls.password;

    if(field.hasError('required'))
      return 'A senha é obrigatória';

    return '';
  }

  getErrorMessagesForConfirmPassword(): string {
    let field = this.form.controls.rePassword;

    if(field.hasError('required'))
      return 'Confirmar a senha é obrigatório';

    if(field.hasError('mustMatch'))
      return 'As senhas devem coincidir';

    return '';
  }

  saveChanges() {
    if (!this.isLogin && !this.isEditProfile) {
      const credentials = this.form.value as CreateUserDTO;
      this.registerForm.emit(credentials);
    }

    else {
      const credentials = this.form.value as LoginDTO;
      this.loginForm.emit(credentials);
    }
  }
}
