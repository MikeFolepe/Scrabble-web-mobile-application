import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-background',
    templateUrl: './background.component.html',
    styleUrls: ['./background.component.scss'],
})
export class BackgroundComponent {
    @Input() isDark: boolean;
    constructor() {
        this.isDark = false;
    }
}
