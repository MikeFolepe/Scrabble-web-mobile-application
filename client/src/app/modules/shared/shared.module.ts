/* eslint-disable no-restricted-imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackgroundComponent } from '@app/pages/background/background.component';
import { PopoutWindowModule } from 'angular-opinionated-popout-window';
import { AddChatRoomComponent } from '../game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '../game-view/change-chat-room/change-chat-room.component';
import { ChatroomsComponent } from '../game-view/chatrooms/chatrooms.component';
import { JoinChatRoomsComponent } from '../game-view/join-chat-rooms/join-chat-rooms.component';
import { PasswordForgottenComponent } from '../game-view/password-forgotten/password-forgotten.component';
import { AppMaterialModule } from '../material.module';

@NgModule({
    declarations: [
        BackgroundComponent,
        AddChatRoomComponent,
        ChatroomsComponent,
        ChangeChatRoomComponent,
        JoinChatRoomsComponent,
        PasswordForgottenComponent,
    ],
    imports: [PopoutWindowModule, CommonModule, AppMaterialModule, ReactiveFormsModule, FormsModule],
    exports: [
        PopoutWindowModule,
        BackgroundComponent,
        AddChatRoomComponent,
        ChatroomsComponent,
        ChangeChatRoomComponent,
        JoinChatRoomsComponent,
        PasswordForgottenComponent,
    ],
})
export class SharedModule {}
