import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';


@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})

export class AuthPageComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder ) { }
  authForm: FormGroup;
  isSubmitted  =  false;
  hasAccount = true;

  ngOnInit() {
    this.authForm  =  this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get formControls() { return this.authForm.controls; }

  signIn(){
    this.isSubmitted = true;
    if(this.authForm.invalid){
      return;
    }
    this.authService.signIn(this.authForm.value);
    this.router.navigateByUrl('/home');
  }

  test() {
    console.log("test")
    return;
  }

  createAccount() {
    this.hasAccount = false;
  }




}
