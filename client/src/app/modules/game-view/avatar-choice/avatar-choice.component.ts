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
    orangeGuy,
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
    selectedFile: File;
    ngOnInit(): void {}

    onFileSelected(event: any) {
        if(event.target.files) {
            var reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = (event: any) => {
                console.log(event.target.result);
                this.authService.chosenAvatar = event.target.result;
            }
        }
    }
}

