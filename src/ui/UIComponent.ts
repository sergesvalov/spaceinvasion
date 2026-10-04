export abstract class UIComponent {
  protected container: HTMLElement;
  protected isMounted: boolean = false;

  constructor(protected parentId: string = 'ui-container') {
    this.container = document.createElement('div');
  }

  // Subclasses must provide the HTML string
  protected abstract template(): string;

  // Called after mounting to bind events (e.g. clicks)
  protected setupBindings(): void {}

  // Called before unmounting to clean up events/intervals
  protected cleanupBindings(): void {}

  public mount(): void {
    if (this.isMounted) return;
    const parent = document.getElementById(this.parentId);
    if (!parent) {
      console.warn(`[UIComponent] Parent element #${this.parentId} not found.`);
      return;
    }

    this.container.innerHTML = this.template();
    this.setupBindings();
    parent.appendChild(this.container);
    this.isMounted = true;
  }

  public unmount(): void {
    if (!this.isMounted) return;
    this.cleanupBindings();
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    this.container.innerHTML = '';
    this.isMounted = false;
  }

  // Helper for binding buttons
  protected bindButton(selector: string, handler: (e: Event) => void): void {
    const el = this.container.querySelector(selector);
    if (el) {
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Try haptic feedback
        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
          (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        handler(e);
      });
    }
  }

  // Helper to query element within this component
  protected $(selector: string): HTMLElement | null {
    return this.container.querySelector(selector);
  }
}
