import { Component, OnInit } from '@angular/core';
import { galaxy, gradient, tartan } from '@common/themePics';

@Component({
    selector: 'app-user-shop',
    templateUrl: './user-shop.component.html',
    styleUrls: ['./user-shop.component.scss'],
})
export class UserShopComponent implements OnInit {
    galaxy: string;
    tartan: string;
    gradient: string;
    constructor() {
        this.gradient = gradient;
        this.galaxy = galaxy;
        this.tartan = tartan;
    }

    ngOnInit(): void {}
}
