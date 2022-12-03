import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AuthPageComponent } from '@app/pages/auth-page/auth-page.component';
import { JoinRoomComponent } from '@app/pages/join-room/join-room.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { PageNotFoundComponent } from '@app/pages/page-not-found/page-not-found.component';
import { WaitingRoomComponent } from '@app/pages/waiting-room/waiting-room.component';
import { AuthGuard } from '@app/services/auth.guard';
import { GameViewComponent } from './game-view/game-view/game-view.component';
import { FormComponent } from './initialize-game/form/form.component';
import { UserPreferencesComponent } from './user-manager/user-preferences/user-preferences.component';
import { UserProfileComponent } from './user-manager/user-profile/user-profile.component';
import { UserShopComponent } from './user-manager/user-shop/user-shop.component';
import { UserStatsComponent } from './user-manager/user-stats/user-stats.component';

const routes: Routes = [
    // { path: '', redirectTo: '/home', pathMatch: 'full' },

    { path: '', component: AuthPageComponent },
    { path: 'auth', component: AuthPageComponent },
    { path: 'home', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: 'solo-game-ai', component: FormComponent },
    { path: 'multiplayer-mode', component: FormComponent },
    { path: 'waiting-room', component: WaitingRoomComponent },
    { path: 'join-room', component: JoinRoomComponent },
    { path: 'game', component: GameViewComponent },
    { path: 'page-not-found', component: PageNotFoundComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: 'statistics', component: UserStatsComponent, canActivate: [AuthGuard] },
    { path : 'shop', component : UserShopComponent, canActivate : [AuthGuard] },
    { path: 'settings', component: UserPreferencesComponent },
    

    { path: '**', redirectTo: '/page-not-found', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule, FormsModule],
})
export class AppRoutingModule {}
