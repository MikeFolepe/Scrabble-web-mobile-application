import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AvatarChoiceComponent } from '@app/modules/game-view/avatar-choice/avatar-choice.component';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-user-preferences',
    templateUrl: './user-preferences.component.html',
    styleUrls: ['./user-preferences.component.scss'],
})
export class UserPreferencesComponent implements OnInit {
    newPseudonym: string;
    constructor(public authService: AuthService, public avatarChoiceDialog: MatDialog, private communicationService: CommunicationService) {
        this.newPseudonym = '';
    }

    ngOnInit(): void {}

    openChangeAvatarDialog() {
        this.avatarChoiceDialog.open(AvatarChoiceComponent, { disableClose: true });
    }

    changeUser() {
        if (this.newPseudonym === '') {
            this.newPseudonym = this.authService.currentUser.pseudonym;
        }

        if (this.authService.chosenAvatar === '') {
            this.authService.chosenAvatar = this.authService.currentUser.avatar;
        }

        this.authService.currentUser.pseudonym = this.newPseudonym;
        this.authService.currentUser.avatar = this.authService.chosenAvatar;

    }
}
