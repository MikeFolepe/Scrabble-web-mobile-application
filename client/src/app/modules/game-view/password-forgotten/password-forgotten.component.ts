import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-password-forgotten',
  templateUrl: './password-forgotten.component.html',
  styleUrls: ['./password-forgotten.component.scss']
})
export class PasswordForgottenComponent{

  pseudonym : string;
  errorMessage : string = '';
  email : string;
  password : string;
 
  constructor(public passwordForgotten: MatDialogRef<PasswordForgottenComponent>, private userService : UserService) {
  }

  async checkPseudonym(){

    this.email = await this.userService.getEmail(this.pseudonym);

    if(!this.email){
      this.errorMessage = "Ce pseudonyme n'existe pas";
      return;
    }
    this.sendEmail();
  }


  private async sendEmail() {
    this.errorMessage = '';
    await this.userService.sendEmailToUser(this.pseudonym);
    this.passwordForgotten.close();
  }
}
