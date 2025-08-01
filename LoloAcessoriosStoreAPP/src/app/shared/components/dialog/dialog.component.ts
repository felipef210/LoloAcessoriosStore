import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  imports: [],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  @Input()
  title!: string;

  @Input()
  message!: string;

  @Input()
  buttonText1!: string;

  @Input()
  buttonText2!: string;

  @Output()
  confirm = new EventEmitter<void>();

  @Output()
  cancel = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
    onEscKey(event: KeyboardEvent) {
      this.onCancel();
    }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

}
