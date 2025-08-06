import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AcessoryDTO, CreateAcessoryDTO, UpdateAcessoryDTO } from '../../../core/interfaces/acessory.models';
import { CdkDragDrop, DragDropModule, moveItemInArray  } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-form-acessory',
  imports: [MatButtonModule, MatIcon, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, DragDropModule],
  templateUrl: './form-acessory.component.html',
  styleUrl: './form-acessory.component.scss'
})
export class FormAcessoryComponent implements OnInit {
  categories: string[] = ['Anel', 'Bracelete', 'Brinco', 'Colar', 'Pulseira'];
  errors!: string[];
  previewImage: string | null = null;
  selectedImageIndex: number = 0;
  imageBase64?: string[];
  selectedFiles: File[] = [];
  imageUrls!: string [];

  @Input()
  isCreation!: boolean;

  @Input()
  model?: AcessoryDTO;

  @Output()
  acessoryForm = new EventEmitter<CreateAcessoryDTO>();

  @Output()
  acessoryUpdateForm = new EventEmitter<UpdateAcessoryDTO>();

  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    name: ['', {validators:[Validators.required]}],
    price: ['', {validators:[Validators.required, Validators.min(0)]}],
    category: ['', {validators:[Validators.required]}],
    description: [''],
    pictures: new FormControl<File[] | null>(null),
    lastUpdate: [new Date()]
  });

  ngOnInit() {
    if (this.model) {
      this.imageUrls = this.model.pictures;
      if (this.model.pictures && this.model.pictures.length > 0) {
        this.imageBase64 = this.model.pictures;
      }

      this.form.patchValue({
        name: this.model.name,
        price: this.model.price.toString(),
        category: this.model.category,
        description: this.model.description,
        lastUpdate: new Date(this.model.lastUpdate)
      });

      if (this.isCreation) {
        this.form.controls.pictures.setValidators([Validators.required]);
        this.form.controls.pictures.updateValueAndValidity();
      }
    }
  }

  markFormAsDirty() {
    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  }

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
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const newFiles: File[] = Array.from(input.files);

      // Join the old files with the new one.
      this.selectedFiles.unshift(...newFiles);

      // Update the form with the full list of the pictures.
      this.form.controls.pictures.setValue(this.selectedFiles);
      this.form.controls.pictures.markAsDirty();
      this.form.controls.pictures.updateValueAndValidity();

      const base64Promises = newFiles.map(file => this.toBase64(file));

      Promise.all(base64Promises)
        .then((base64Images: string[]) => {
          this.imageBase64 = [...base64Images, ...(this.imageBase64 || [])];
          this.selectedImageIndex = 0;
        })
        .catch(error => console.error('Erro ao converter imagens:', error));
    }
  }

  removeNewImage(index: number): void {
    if (!this.imageBase64 || index >= this.selectedFiles.length) return;

    this.imageBase64.splice(index, 1);

    if (index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
    }

    this.form.controls.pictures.setValue(this.selectedFiles);
    this.form.controls.pictures.markAsDirty();
    this.form.controls.pictures.updateValueAndValidity();

    if (this.selectedImageIndex >= this.imageBase64.length) {
      this.selectedImageIndex = this.imageBase64.length - 1;
    }

    this.markFormAsDirty();
  }

  removeExistingImage(index: number): void {
    if (!this.imageUrls || index >= this.imageUrls.length) return;

    this.imageUrls.splice(index, 1);

    if (this.imageBase64) {
      this.imageBase64.splice(index, 1);
    }

    if (this.selectedImageIndex >= this.imageUrls.length)
      this.selectedImageIndex = this.imageUrls.length - 1;

    this.markFormAsDirty();
  }

  setMainImage(index: number) {
    if (this.isCreation) {
      if (!this.imageBase64 || !this.selectedFiles) return;

      const base64Main = this.imageBase64.splice(index, 1)[0];
      this.imageBase64.unshift(base64Main);

      const fileMain = this.selectedFiles.splice(index, 1)[0];
      console.log(this.selectedFiles);
      this.selectedFiles.unshift(fileMain);
    }

    else {
      if (!this.imageUrls) return;

      const mainImage = this.imageUrls.splice(index, 1)[0];
      this.imageUrls.unshift(mainImage);

      this.markFormAsDirty();
    }

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

    const rawValue = this.form.getRawValue();

    if (this.isCreation) {
      const acessory: CreateAcessoryDTO = {
        name: rawValue.name!,
        price: parseFloat(rawValue.price as string),
        description: rawValue.description || '',
        category: rawValue.category!,
        pictures: rawValue.pictures || [],
        lastUpdate: new Date()
      };

      this.acessoryForm.emit(acessory);
    }

    else {
      const acessory: UpdateAcessoryDTO = {
        name: rawValue.name!,
        price: parseFloat(rawValue.price as string),
        description: rawValue.description || '',
        category: rawValue.category!,
        existingPictures: this.imageUrls || [],
        newPictures: this.selectedFiles || [],
        lastUpdate: new Date()
      }

      this.acessoryUpdateForm.emit(acessory);
    }
  }
}
