import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AcessoryDTO, CreateAcessoryDTO } from '../../../core/interfaces/acessory.models';
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

  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    name: ['', {validators:[Validators.required]}],
    price: ['', {validators:[Validators.required, Validators.min(0)]}],
    category: ['', {validators:[Validators.required]}],
    description: [''],
    pictures: new FormControl<File[] | null>(null, {validators: [Validators.required]}),
    lastUpdate: [new Date()]
  });

  ngOnInit() {
    if (this.model) {
      this.imageUrls = this.model.pictures;
      if (this.model.pictures && this.model.pictures.length > 0) {
        this.imageBase64 = this.model.pictures;

        // Converter URLs para File[] e adicionar ao form
        Promise.all(
          this.model.pictures.map((url, index) =>
            this.urlToFile(url, `imagem-${index}.jpg`)
          )
        ).then((files: File[]) => {
          const currentPictures = this.form.controls.pictures.value || [];
          this.form.controls.pictures.setValue([...currentPictures, ...files]);
        });
      }

      this.form.patchValue({
        name: this.model.name,
        price: this.model.price.toString(),
        category: this.model.category,
        description: this.model.description,
        lastUpdate: new Date(this.model.lastUpdate),
        pictures: this.selectedFiles
      });

      console.log(this.form.value);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.imageUrls, event.previousIndex, event.currentIndex);
    this.selectedImageIndex = 0;
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
      const files: File[] = Array.from(input.files);
      this.form.patchValue({pictures: files});
      this.selectedFiles = files;
      this.imageBase64 = [];

      files.forEach((file, index) => {
        this.toBase64(file)
          .then((value: string) => {
            this.imageBase64![index] = value;

            if (index === 0) {
              this.previewImage = value;
            }
          })
          .catch(error => console.error(error));
      });
    }
  }

  setMainImage(index: number): void {
    if (!this.imageBase64 || !this.selectedFiles) return;

    const base64Main = this.imageBase64.splice(index, 1)[0];
    this.imageBase64.unshift(base64Main);

    const fileMain = this.selectedFiles.splice(index, 1)[0];
    this.selectedFiles.unshift(fileMain);

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

  private async urlToFile(url: string, filename: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }

  saveChanges() {
    if (this.form.invalid || !this.imageBase64) return;

    const rawValue = this.form.getRawValue();

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
}
