/* eslint-disable no-underscore-dangle */
import { Component } from '@angular/core';
import { Themes } from '@app/classes/themes';
import { AdministratorService } from '@app/services/administrator.service';
import { AuthService } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { UserService } from '@app/services/user.service';
import { galaxy, gradient, tartan } from '@common/themePics';
import { Item } from '@common/user-preferences';

@Component({
    selector: 'app-user-shop',
    templateUrl: './user-shop.component.html',
    styleUrls: ['./user-shop.component.scss'],
})
export class UserShopComponent {
    themes: Themes;
    galaxy: string;
    tartan: string;
    gradient: string;
    constructor(
        public userService: UserService,
        public authService: AuthService,
        private communicationService: CommunicationService,
        private administratorService: AdministratorService,
    ) {
        this.gradient = gradient;
        this.galaxy = galaxy;
        this.tartan = tartan;
        this.themes = new Themes();
    }

    addBoardTheme(boardItem: Item) {
        if (this.authService.currentUser.xpPoints < boardItem.price) {
            this.administratorService.displayMessage("Vous n'avez pas assez d'XP");
            return;
        }

        const found = this.userService.userPreferences.boardItems.find((curB) => curB.name === boardItem.name);
        if (found !== undefined) {
            this.administratorService.displayMessage('Vous possédez déjà ce thème');
            return;
        }
        this.communicationService.addBoardTheme(this.authService.currentUser._id, boardItem.name).subscribe(async (validation: boolean) => {
            if (validation) {
                this.administratorService.displayMessage('Thème ajouté');
                this.authService.currentUser.xpPoints -= boardItem.price;
                this.communicationService.updateXps(this.authService.currentUser._id, this.authService.currentUser.xpPoints);
                await this.userService.getBoards(this.authService.currentUser._id);
                console.log(this.userService.userPreferences);
            } else {
                this.administratorService.displayMessage('Achat échoué');
            }
        });
    }

    addChatTheme(chatItem: Item) {
        if (this.authService.currentUser.xpPoints < chatItem.price) {
            this.administratorService.displayMessage("Vous n'avez pas assez d'XP");
            return;
        }

        const found = this.userService.userPreferences.chatItems.find((curB) => curB.name === chatItem.name);
        if (found !== undefined) {
            this.administratorService.displayMessage('Vous possédez déjà ce thème');
            return;
        }
        this.communicationService.addChatTheme(this.authService.currentUser._id, chatItem.name).subscribe(async (validation: boolean) => {
            if (validation) {
                this.administratorService.displayMessage('Thème ajouté');
                this.authService.currentUser.xpPoints -= chatItem.price;
                this.communicationService.updateXps(this.authService.currentUser._id, this.authService.currentUser.xpPoints);
                await this.userService.getChats(this.authService.currentUser._id);
                console.log(this.userService.userPreferences);
            } else {
                this.administratorService.displayMessage('Achat échoué');
            }
        });
    }
}
