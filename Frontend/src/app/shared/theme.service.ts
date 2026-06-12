import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = 'wms_theme';
  private currentTheme: 'light' | 'dark' = 'light';

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.themeKey) as 'light' | 'dark';
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme = 'dark';
      }
    }
    this.applyTheme(this.currentTheme);
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(this.themeKey, this.currentTheme);
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
