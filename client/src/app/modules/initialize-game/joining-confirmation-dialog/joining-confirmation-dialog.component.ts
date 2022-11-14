import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-joining-confirmation-dialog',
    templateUrl: './joining-confirmation-dialog.component.html',
    styleUrls: ['./joining-confirmation-dialog.component.scss'],
})
export class JoiningConfirmationDialogComponent {
    message: string;
    constructor(public joiningConfirmation: MatDialogRef<JoiningConfirmationDialogComponent>) {}
}
