import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AvatarChoiceComponent } from '@app/modules/game-view/avatar-choice/avatar-choice.component';
import { PasswordForgottenComponent } from '@app/modules/game-view/password-forgotten/password-forgotten.component';
import { AuthService } from '@app/services/auth.service';
import { UserService } from '@app/services/user.service';
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
    errorMessage = '';
    signUpError = '';
    // choseAvatar = false;
    constructor(
        public userService: UserService,
        public authService: AuthService,
        private formBuilder: FormBuilder,
        public passwordForgottenDialog : MatDialog,
        public avatarChoiceDialog: MatDialog,
    ) {}

    ngOnInit() {
        this.authForm = this.formBuilder.group({
            pseudonym: ['', Validators.required],
            password: ['', Validators.required],
        });
        this.createAccountForm = this.formBuilder.group({
            pseudonym: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
        });
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

        const userFound: boolean = await this.userService.findUserInDb(this.pseudonymValue, this.passwordValue);

        if (!userFound) {
            this.errorMessage = 'Le pseudonyme ou le mot de passe entré est incorrect';
            return;
        }

        this.authService.signIn(this.authForm.value);
    }

    async signUp() {
        this.isSubmitted = true;

        this.avatarValue = this.authService.chosenAvatar;

        if (this.createAccountForm.invalid || this.avatarValue === '') {
            return;
        }

        const pseudonymExists: boolean = await this.userService.checkIfPseudonymExists(this.pseudonymValue);

        if (pseudonymExists) {
            this.signUpError = 'Ce pseudonyme est déjà utilisé';
            return;
        }
        this.signUpError = '';


        //verification de la bonne ecriture de l'addresse courriel
        const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!this.emailValue.match(regex)) {
            this.signUpError = 'L\'adresse courriel entrée n\'est pas valide';
            return;
        }

        this.signUpError = '';

        if (this.passwordValue !== this.confirmPasswordValue) {
            this.signUpError = 'Les mots de passe ne correspondent pas';
            return;
        }
        
        this.signUpError = '';
        

        const user = new User(this.avatarValue, this.pseudonymValue, this.passwordValue, this.emailValue, false, '');
        this.userService.addUserToDatabase(user);
        this.pseudonymValue = '';
        this.passwordValue = '';
        this.confirmPasswordValue = '';
        this.authService.chosenAvatar = '';
        this.emailValue = '';
        this.hasAccount = true;
    }

    openPasswordForgottenDialog() {
        this.passwordForgottenDialog.open(PasswordForgottenComponent, {disableClose : true});
    }

    invalidPassword() {
        if (this.passwordValue === '') {
            return false;
        }

        // regex qui verifie qu'il y a au moins 8 caracteres, une majuscule, une minuscule, un chiffre et un caractere special
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (this.passwordValue.match(regex)) {
            return false;
        }
        return true;
    }

    openAvatarDialog() {
        this.avatarChoiceDialog.open(AvatarChoiceComponent, { disableClose: true });
    }
}
