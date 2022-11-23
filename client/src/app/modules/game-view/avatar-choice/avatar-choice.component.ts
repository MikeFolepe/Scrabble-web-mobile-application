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
        this.selectedFile = <File> event.target.files[0];
        console.log(this.selectedFile.name);
        //fs file system
    }

    // onUpload(){
    //     const fd = new FormData();
    //     fd.append('image', this.selectedFile, this.selectedFile.name);
    //     console.log(fd);
    //     this.http.post('http://localhost:3000/assets/uploadedAvatars', fd)
    //       .subscribe(res => {
    //         console.log(res);
    //       });

    //   }
    
}
