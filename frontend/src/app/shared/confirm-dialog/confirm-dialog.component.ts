import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly title = input<string>('Confirmar ação');
  readonly message = input<string>('');
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');
  readonly danger = input(false);
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly confirmBtn = viewChild<ElementRef<HTMLButtonElement>>('confirmBtn');

  constructor() {
    afterNextRender(() => {
      this.confirmBtn()?.nativeElement.focus();
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
