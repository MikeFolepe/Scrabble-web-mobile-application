import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AvatarChoiceComponent } from '@app/modules/game-view/avatar-choice/avatar-choice.component';
import { AdministratorService } from '@app/services/administrator.service';
import { AuthService } from '@app/services/auth.service';
import { User } from '@common/user';

@Component({
    selector: 'app-auth-page',
    templateUrl: './auth-page.component.html',
    styleUrls: ['./auth-page.component.scss'],
})
export class AuthPageComponent implements OnInit {
    authForm: FormGroup;
    createAccountForm: FormGroup;
    isSubmitted = false;
    validIpAddress = true;
    validPseudonym = true;
    hasAccount = true;
    notEmpty = true;
    pseudonymValue = '';
    passwordValue = '';
    confirmPasswordValue = '';
    avatarValue = '';
    emailValue = '';
    ipAddressValue = '';
    differentPasswords = false;
    errorMessage = '';
    // choseAvatar = false;
    constructor(
        private administratorService: AdministratorService,
        public authService: AuthService,
        private formBuilder: FormBuilder,
        public avatarChoiceDialog: MatDialog,
    ) {}

    ngOnInit() {
        this.authForm = this.formBuilder.group({
            pseudonym: ['', Validators.required],
            password: ['', Validators.required],
        });
        this.createAccountForm = this.formBuilder.group({
            // avatar : ['', Validators.required],
            pseudonym: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
        });
        this.administratorService.initializeUsers();
    }

    get formControls() {
        return this.authForm.controls;
    }

    get formControlsCreateAccount() {
        return this.createAccountForm.controls;
    }

    async signIn() {
        this.isSubmitted = true;

        if (this.authForm.invalid) {
            return;
        }

        const userFound: Boolean = await this.findUser();

        if (!userFound) {
            this.errorMessage = 'Le pseudonyme ou le mot de passe entré est incorrect';
            return;
        }

        this.authService.signIn(this.authForm.value);
    }

    invalidPassword() {
        if (this.passwordValue === '') {
            return false;
        }
        // regex that checks if password contains at least 8 characters, one uppercase, one lowercase, one number and one special character
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (this.passwordValue.match(regex)) {
            return false;
        }
        return true;
    }

    signUp() {
        this.isSubmitted = true;

        this.avatarValue = this.authService.chosenAvatar;

        if (this.createAccountForm.invalid || this.avatarValue === '') {
            return;
        }

        if (this.passwordValue !== this.confirmPasswordValue) {
            this.differentPasswords = true;
            return;
        }
        this.differentPasswords = false;

        const user = new User(this.avatarValue, this.pseudonymValue, this.passwordValue, this.emailValue, false, '');
        this.administratorService.addUserToDatabase(user);
    }

    openDialog() {
        this.avatarChoiceDialog.open(AvatarChoiceComponent, { disableClose: true });
    }

    createAccount() {
        this.hasAccount = false;
    }

    private async findUser() {
        for (const user of this.administratorService.user) {
            if (user.pseudonym === this.pseudonymValue) {
                if (await this.administratorService.checkPassword(this.pseudonymValue, this.passwordValue)) {
                    return true;
                }
            }
        }
        return false;
    }
}
