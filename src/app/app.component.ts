import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, state, style, animate, transition, query, group } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('logoAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('menuAnimation', [
      state('closed', style({
        height: '0',
        opacity: '0',
        transform: 'translateY(-20px)'
      })),
      state('open', style({
        height: '*',
        opacity: '1',
        transform: 'translateY(0)'
      })),
      transition('closed <=> open', animate('0.3s ease-in-out'))
    ]),
    trigger('themeAnimation', [
      state('light', style({ transform: 'rotate(0)' })),
      state('dark', style({ transform: 'rotate(360deg)' })),
      transition('light <=> dark', animate('0.3s ease-in-out'))
    ]),
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'absolute',
            width: '100%',
            opacity: 0,
            transform: 'translateY(20px)'
          })
        ], { optional: true }),
        group([
          query(':leave', [
            animate('200ms ease-out', style({
              opacity: 0,
              transform: 'translateY(-20px)'
            }))
          ], { optional: true }),
          query(':enter', [
            animate('300ms ease-out', style({
              opacity: 1,
              transform: 'translateY(0)'
            }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  isScrolled = false;
  isMenuOpen = false;
  isDarkTheme = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  ngOnInit() {
    // Charger le thème depuis le localStorage
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.applyTheme();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

  animateLink(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (event.type === 'mouseenter') {
      target.style.transform = 'translateY(-2px)';
      target.style.transition = 'transform 0.2s ease-out';
    } else {
      target.style.transform = 'translateY(0)';
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] || '';
  }
}
