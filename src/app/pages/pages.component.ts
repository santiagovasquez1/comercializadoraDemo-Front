import { environment } from './../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Observable, Subscription, fromEvent, map } from 'rxjs';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styles: [
  ]
})
export class PagesComponent implements OnInit {
  drawerMode: MatDrawerMode;
  isDraweOpened: boolean = true;
  observerWidth: Observable<number>;
  subscriptionWidth: Subscription;

  constructor() {
    this.drawerMode = 'side';
    console.log(environment.killerapp_url);
  }
  ngOnInit(): void {
    this.getWindowWidth(window.innerWidth);

    this.observerWidth = fromEvent(window, 'resize').pipe(
      map(() => {
        return window.innerWidth;
      })
    );

    this.subscriptionWidth = this.observerWidth.subscribe({
      next: (data) => {
        this.getWindowWidth(data);
      }
    });
  }

  private getWindowWidth(data: number) {
    if (data <= 767.98) {
      this.drawerMode = 'over';
      this.isDraweOpened = false;
    } else {
      this.drawerMode = 'side';
      this.isDraweOpened = true;
    }
  }

  onOpenClick() {
    this.isDraweOpened = true;
  }

  onClose() {
    this.isDraweOpened = window.innerWidth <= 767.98 ? false : true;
  }
}
