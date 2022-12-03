/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { GameViewModule } from '@app/modules/game-view/game-view.module';
import { InitializeGameModule } from '@app/modules/initialize-game/initialize-game.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { AppComponent } from '@app/pages/app/app.component';
import { JoinRoomComponent } from '@app/pages/join-room/join-room.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { PageNotFoundComponent } from '@app/pages/page-not-found/page-not-found.component';
import { WaitingRoomComponent } from '@app/pages/waiting-room/waiting-room.component';
import { TranslateModule } from '@ngx-translate/core';
import { ClickOutsideModule } from 'ng-click-outside';
import { UserManagerModule } from './modules/user-manager/user-manager.module';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { EditDictionaryDialogComponent } from './pages/admin-page/edit-dictionary-dialog/edit-dictionary-dialog.component';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { RankingComponent } from './pages/ranking/ranking.component';
import { NotificationsDialogComponent } from './pages/notifications-dialog/notifications-dialog.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */

@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        PageNotFoundComponent,
        WaitingRoomComponent,
        JoinRoomComponent,
        AdminPageComponent,
        EditDictionaryDialogComponent,
        AuthPageComponent,
        RankingComponent,
        NotificationsDialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        GameViewModule,
        InitializeGameModule,
        SharedModule,
        ClickOutsideModule,
        ReactiveFormsModule,
        UserManagerModule,
        TranslateModule.forRoot(),
    ],
    providers: [MainPageComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
