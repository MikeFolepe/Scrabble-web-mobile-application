import { Injectable } from '@angular/core';
import { User } from 'src/user';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }
  public signIn(userData: User){
    localStorage.setItem('ACCESS_TOKEN', "access_token");
  }
  public isLoggedIn(){
    return true;
  }
  public logout(){
    localStorage.removeItem('ACCESS_TOKEN');
  }
}
