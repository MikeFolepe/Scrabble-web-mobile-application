import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { AppMaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';
import { UserMenuNavComponent } from './user-menu-nav/user-menu-nav.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserListDialogComponent } from './user-profile/user-list-dialog/user-list-dialog.component';
import { UserStatsComponent } from './user-stats/user-stats.component';

@NgModule({
    declarations: [UserMenuNavComponent, UserProfileComponent, UserListDialogComponent, UserStatsComponent],
    imports: [CommonModule, AppRoutingModule, SharedModule, AppMaterialModule],
    exports: [UserMenuNavComponent],
})
export class UserManagerModule {}
