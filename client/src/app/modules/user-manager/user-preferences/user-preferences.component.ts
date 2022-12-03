import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AvatarChoiceComponent } from '@app/modules/game-view/avatar-choice/avatar-choice.component';
import { AdministratorService } from '@app/services/administrator.service';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { User } from '@common/user';

@Component({
    selector: 'app-user-preferences',
    templateUrl: './user-preferences.component.html',
    styleUrls: ['./user-preferences.component.scss'],
})
export class UserPreferencesComponent {
    newPseudonym: string;
    isNewPseudonym = true;
    constructor(
        public authService: AuthService,
        public avatarChoiceDialog: MatDialog,
        private communicationService: CommunicationService,
        private adminService: AdministratorService,
    ) {
        this.newPseudonym = '';
    }

    openChangeAvatarDialog() {
        this.avatarChoiceDialog.open(AvatarChoiceComponent, { disableClose: true });
    }

    changeUser() {
        if (this.newPseudonym === '') {
            this.newPseudonym = this.authService.currentUser.pseudonym;
            this.isNewPseudonym = false;
        }

        if (this.authService.chosenAvatar === '') {
            this.authService.chosenAvatar = this.authService.currentUser.avatar;
        }

        if (this.newPseudonym === this.authService.currentUser.pseudonym) {
            this.isNewPseudonym = false;
        }

        this.authService.currentUser.pseudonym = this.newPseudonym;
        this.authService.currentUser.avatar = this.authService.chosenAvatar;

        this.communicationService.updateUser(this.authService.currentUser, this.isNewPseudonym).subscribe((newUser: User) => {
            this.authService.currentUser = newUser;
            this.adminService.displayMessage('Changements éffectués');
        });
    }
}
