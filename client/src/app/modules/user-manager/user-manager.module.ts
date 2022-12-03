import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { AppMaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';
import { BoardThemeDialogComponent } from './board-theme-dialog/board-theme-dialog.component';
import { ChatroomThemeDialogComponent } from './chatroom-theme-dialog/chatroom-theme-dialog.component';
import { UserMenuNavComponent } from './user-menu-nav/user-menu-nav.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { UserListDialogComponent } from './user-profile/user-list-dialog/user-list-dialog.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserShopComponent } from './user-shop/user-shop.component';
import { UserStatsComponent } from './user-stats/user-stats.component';

@NgModule({
    declarations: [
        UserMenuNavComponent,
        UserProfileComponent,
        UserListDialogComponent,
        UserStatsComponent,
        UserPreferencesComponent,
        UserShopComponent,
        BoardThemeDialogComponent,
        ChatroomThemeDialogComponent,
    ],
    imports: [CommonModule, AppRoutingModule, SharedModule, AppMaterialModule],
    exports: [UserMenuNavComponent],
})
export class UserManagerModule {}
