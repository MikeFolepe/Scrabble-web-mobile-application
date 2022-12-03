/* eslint-disable @typescript-eslint/no-shadow */
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import {
    blondeGirl,
    blondeGuy,
    brunetteGirl,
    doggo,
    earringsGirl,
    gingerGirl,
    hatGirl,
    musicGuy,
    mustacheGuy,
    orangeGuy
} from '@common/defaultAvatars';

@Component({
    selector: 'app-avatar-choice',
    templateUrl: './avatar-choice.component.html',
    styleUrls: ['./avatar-choice.component.scss'],
})
export class AvatarChoiceComponent implements OnInit {
    blondeGirl : string;
    blondeGuy : string;
    brunetteGirl : string;
    musicGuy : string;
    earringsGirl : string;
    gingerGirl : string;
    hatGirl : string;
    doggo : string;
    mustacheGuy : string;
    orangeGuy : string;


    constructor(public avatarChoice: MatDialogRef<AvatarChoiceComponent>, public authService: AuthService) {
        this.blondeGirl = blondeGirl;
        this.blondeGuy = blondeGuy;
        this.brunetteGirl = brunetteGirl;
        this.musicGuy = musicGuy;
        this.earringsGirl = earringsGirl;
        this.gingerGirl = gingerGirl;
        this.hatGirl = hatGirl;
        this.doggo = doggo;
        this.mustacheGuy = mustacheGuy;
        this.orangeGuy = orangeGuy;
    }
    ngOnInit(): void {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFileSelected(event: any) {
        if (event.target.files) {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reader.onload = (event: any) => {
                console.log(event.target.result);
                this.authService.chosenAvatar = event.target.result;
            };
        }
        this.avatarChoice.close();
    }
}

