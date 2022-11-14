import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GAME_PASSWORD_SIZE, SPECIAL_CHAR, VALIDATION_PATTERN } from '@common/constants';
import { CustomRange } from '@common/range';

@Component({
    selector: 'app-password-game-dialog',
    templateUrl: './password-game-dialog.component.html',
    styleUrls: ['./password-game-dialog.component.scss'],
})
export class PasswordGameDialogComponent implements OnInit {
    form: FormControl;
    passwordSize: CustomRange;
    specialChar: string;
    changeToPasswordInput: boolean;
    constructor(public gamePasswordDialogRef: MatDialogRef<PasswordGameDialogComponent>) {
        this.form = new FormControl();
        this.passwordSize = GAME_PASSWORD_SIZE;
        this.specialChar = SPECIAL_CHAR;
        this.changeToPasswordInput = false;
    }

    ngOnInit(): void {
        this.form.setValidators([
            Validators.required,
            Validators.pattern(VALIDATION_PATTERN),
            Validators.minLength(GAME_PASSWORD_SIZE.min),
            Validators.maxLength(GAME_PASSWORD_SIZE.max),
        ]);
    }
}
