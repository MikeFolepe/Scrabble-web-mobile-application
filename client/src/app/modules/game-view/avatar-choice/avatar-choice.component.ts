/* eslint-disable @typescript-eslint/no-shadow */
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';

@Component({
    selector: 'app-avatar-choice',
    templateUrl: './avatar-choice.component.html',
    styleUrls: ['./avatar-choice.component.scss'],
})
export class AvatarChoiceComponent implements OnInit {
    constructor(public avatarChoice: MatDialogRef<AvatarChoiceComponent>, public authService: AuthService) {}
    selectedFile: File;
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
    }
}
