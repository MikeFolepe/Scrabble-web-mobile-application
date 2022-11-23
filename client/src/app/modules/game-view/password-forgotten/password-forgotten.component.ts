import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-password-forgotten',
  templateUrl: './password-forgotten.component.html',
  styleUrls: ['./password-forgotten.component.scss']
})
export class PasswordForgottenComponent implements OnInit {

  pseudonym : string
  constructor(public passwordForgotten: MatDialogRef<PasswordForgottenComponent>) {}
  
  ngOnInit(): void {
  }

}
