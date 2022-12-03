import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
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
    constructor(public joinChatRoomsDialog: MatDialog, public changeChatRoomDialog: MatDialog,public addChatRoomDialog: MatDialog) {
        this.gradient = gradient;
        this.galaxy = galaxy;
        this.tartan = tartan;
    }

    ngOnInit(): void {}

    openChangeChatRoomDialog(): void {
        this.changeChatRoomDialog.open(ChangeChatRoomComponent, { disableClose: true });
    }

    openJoinChatRoomDialog(): void {
        this.joinChatRoomsDialog.open(JoinChatRoomsComponent, { disableClose: true });
    }

    openAddChatRoomDialog(): void {
        this.addChatRoomDialog.open(AddChatRoomComponent, { disableClose: true });
    }
}
