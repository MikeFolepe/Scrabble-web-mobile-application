import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { GiveUpGameDialogComponent } from '@app/modules/game-view/give-up-game-dialog/give-up-game-dialog.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { FormComponent } from './form/form.component';
import { LevelFieldComponent } from './level-field/level-field.component';
import { NameSelectorComponent } from './name-selector/name-selector.component';
import { PlayerNameFieldComponent } from './player-name-field/player-name-field.component';
import { TimerFieldComponent } from './timer-field/timer-field.component';
import { VisibilityFieldComponent } from './visibility-field/visibility-field.component';
import { PasswordGameDialogComponent } from './password-game-dialog/password-game-dialog.component';
import { JoiningConfirmationDialogComponent } from './joining-confirmation-dialog/joining-confirmation-dialog.component';

@NgModule({
    declarations: [
        FormComponent,
        PlayerNameFieldComponent,
        TimerFieldComponent,
        LevelFieldComponent,
        NameSelectorComponent,
        GiveUpGameDialogComponent,
        VisibilityFieldComponent,
        PasswordGameDialogComponent,
        JoiningConfirmationDialogComponent,
    ],
    imports: [CommonModule, AppRoutingModule, SharedModule, MatDialogModule, FormsModule, AppMaterialModule, ReactiveFormsModule],
    exports: [FormComponent],
    entryComponents: [NameSelectorComponent],
})
export class InitializeGameModule {}
