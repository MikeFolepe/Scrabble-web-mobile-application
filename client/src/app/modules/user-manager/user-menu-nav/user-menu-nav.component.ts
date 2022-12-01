import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-user-menu-nav',
    templateUrl: './user-menu-nav.component.html',
    styleUrls: ['./user-menu-nav.component.scss'],
})
export class UserMenuNavComponent implements OnInit {
    isNavOpen: boolean;

    ngOnInit(): void {
        this.isNavOpen = false;
    }

    openNav(): void {
        const slidingMenu = document.getElementById('mySidenav') as HTMLElement;
        slidingMenu.style.width = '400px';
        this.isNavOpen = true;
    }

    closeNav(): void {
        const slidingMenu = document.getElementById('mySidenav') as HTMLElement;
        slidingMenu.style.width = '0';
        this.isNavOpen = false;
    }
}
