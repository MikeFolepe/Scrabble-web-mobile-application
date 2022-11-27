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
