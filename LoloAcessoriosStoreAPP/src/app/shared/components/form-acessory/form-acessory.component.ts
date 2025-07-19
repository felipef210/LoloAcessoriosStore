import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AcessoryService } from '../../../core/services/acessory.service';
import { CreateAcessoryDTO } from '../../../core/interfaces/acessory.models';
import { now } from 'moment';


@Component({
  selector: 'app-form-acessory',
  imports: [MatButtonModule, MatIcon, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './form-acessory.component.html',
  styleUrl: './form-acessory.component.scss'
})
export class FormAcessoryComponent {
  categories: string[] = ['Anel', 'Bracelete', 'Brinco', 'Colar', 'Pulseira'];
  errors!: string[];
  previewImage: string | null = null;
  selectedImageIndex: number = 0;
  imageBase64?: string[];
  private selectedFiles: File[] = [];

  @Input()
  isCreation!: boolean;

  @Output()
  acessoryForm = new EventEmitter<CreateAcessoryDTO>();

  private formBuilder = inject(FormBuilder);
  private readonly acessoryService = inject(AcessoryService);

  form = this.formBuilder.group({
    name: ['', {validators:[Validators.required]}],
    price: ['', {validators:[Validators.required, Validators.min(0)]}],
    category: ['', {validators:[Validators.required]}],
    description: [''],
    pictures: this.formBuilder.control<File[] | null>(null, [Validators.required])
  });

  getErrorMessagesForName(): string {
    let field = this.form.controls.name;

    if(field.hasError('required'))
      return 'O nome é obrigatório';

    return '';
  }

  getErrorMessagesForPrice(): string {
    let field = this.form.controls.price;

    if(field.hasError('required'))
      return 'O preço é obrigatório';

    else if(field.hasError('min'))
      return 'Preço deve ser pelo menos R$0,00';

    return '';
  }

  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;

    if (files && files.length > 0) {
      const selectedFiles: File[] = Array.from(files);

      this.form.patchValue({ pictures: selectedFiles });

      this.imageBase64 = [];

      selectedFiles.forEach((file, i) => {
        this.toBase64(file)
          .then((value: string) => {
            this.imageBase64![i] = value;
          })
          .catch(error => console.error(error));
      });
    }

    this.selectedImageIndex = 0;
  }

  setMainImage(index: number): void {
    if (!this.imageBase64 || !this.selectedFiles) return;

    const base64Main = this.imageBase64.splice(index, 1)[0];
    this.imageBase64.unshift(base64Main);

    const fileMain = this.selectedFiles.splice(index, 1)[0];
    this.selectedFiles.unshift(fileMain);

    this.form.patchValue({ pictures: this.selectedFiles });

    this.selectedImageIndex = 0;
  }

  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  saveChanges() {
    if (this.form.invalid || !this.imageBase64) return;

    const dto: CreateAcessoryDTO = {
      name: this.form.get('name')!.value!,
      price: +this.form.get('price')!.value!,
      category: this.form.get('category')!.value!,
      description: this.form.get('description')!.value || '',
      pictures: this.form.get('pictures')!.value!,
      lastUpdate: new Date()
    };

    this.acessoryForm.emit(dto);
  }
}
