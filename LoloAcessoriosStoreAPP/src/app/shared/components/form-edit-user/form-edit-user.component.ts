import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UpdateOwnProfileDTO, UpdateProfileDTO, UserProfileDTO } from '../../../core/interfaces/user.models';

@Component({
  selector: 'app-form-edit-user',
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatSlideToggleModule],
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
    isEnabled: new FormControl<Boolean>(false)
  });

  menu: string = 'personal';

  ngOnInit() {
    this.form.patchValue({
      name: this.model.name,
      email: this.model.email,
      gender: this.model.gender,
      dateOfBirth: this.formatDate(this.model.dateOfBirth)
    });
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

    if(this.menu == 'personal')
      this.form.get('isEnabled')?.setValue(false);
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

}
