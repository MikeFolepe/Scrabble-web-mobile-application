import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@app/services/user.service';
// import nodemailer from 'nodemailer';


@Component({
  selector: 'app-password-forgotten',
  templateUrl: './password-forgotten.component.html',
  styleUrls: ['./password-forgotten.component.scss']
})
export class PasswordForgottenComponent implements OnInit {

  pseudonym : string;
  errorMessage : string = '';
  email : string;
  constructor(public passwordForgotten: MatDialogRef<PasswordForgottenComponent>, private userService : UserService) {}
  
  ngOnInit(): void {
  }

  async checkPseudonym(){

    this.email = await this.userService.checkPseudonymForPassword(this.pseudonym);
    console.log(this.email);

    if(!this.email){
      this.errorMessage = "Ce pseudonyme n'existe pas";
      return;
    }
    this.errorMessage = '';
    // this.sendEmail();
    this.passwordForgotten.close();
  }

  // private sendEmail() {
  //   const myTransport = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: 'project.scrabble110@gmail.com', // your gmail account which you'll use to send the emails
  //       pass: 'Team110!', // the password for your gmail account
  //     }
  //   });

  //   const mailOptions = {
  //     from: 'SilvenLEAF<project.scrabble110@gmail.com>', // from where the email is going, you can type anything or any name here, it'll be displayed as the sender to the person who receives it
  //     to: this.email, // the email address(es) where you want to send the emails to. If it's more than one person/email, seperate them with a comma, like here how I seperated the 3 users with a comma
    
  //     subject: 'Mot de passe oublié - Scrabble 110', // your email subject (optional but better to have it)
  //     text: `Bonjour,
  //     Voici votre mot de passe : 
  //     `, // your email body in plain text format (optional) 
    
  //     // your email body in html format (optional)
  //     // if you want to send a customly and amazingly designed html body
  //     // instead of a boring plain text, then use this "html" property
  //     // instead of "text" property
  //     html: `<h1 style="color: red;text-align:center">Hello there my sweetling!</h1>
  //            <p style="text-align:center">Let's send some <span style="color: red">freaking</span> emails!</p>`,
  //   }

  //   myTransport.sendMail(mailOptions, (err : any) => {
  //     if (err) {
  //       console.log(`Email is failed to send!`);
  //       console.error(err);
  //     } else {
  //       console.log(`Email is successfully sent!`);
  //     }
  //   });

  // }


}
