/* eslint-disable no-restricted-imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackgroundComponent } from '@app/pages/background/background.component';
import { AddChatRoomComponent } from '../game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '../game-view/change-chat-room/change-chat-room.component';
import { ChatroomsComponent } from '../game-view/chatrooms/chatrooms.component';
import { JoinChatRoomsComponent } from '../game-view/join-chat-rooms/join-chat-rooms.component';
import { AppMaterialModule } from '../material.module';

@NgModule({
    declarations: [BackgroundComponent, AddChatRoomComponent, ChatroomsComponent, ChangeChatRoomComponent, JoinChatRoomsComponent],
    imports: [CommonModule, AppMaterialModule, ReactiveFormsModule, FormsModule],
    exports: [BackgroundComponent, AddChatRoomComponent, ChatroomsComponent, ChangeChatRoomComponent, JoinChatRoomsComponent],
})
export class SharedModule {}
