import { Injectable } from '@angular/core';
import { User } from '@common/user';
import { AdministratorService } from './administrator.service';
import { CommunicationService } from './communication.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private communicationService: CommunicationService, private administratorService: AdministratorService) { 
  }

  addUserToDatabase(user: User) {
    this.addUser(user);   
  }

  async findUserInDb(pseudonym: string, password: string) {
    return this.communicationService.findUserInDb(pseudonym, password);
  }

  async checkIfPseudonymExists(pseudonym: string) {
      return this.communicationService.checkPseudonym(pseudonym);
  }

  private addUser(user: User): void {
    this.communicationService.addNewUserToDB(user).subscribe((userFromDB: User) => {
        this.administratorService.displayMessage('Utilisateur ajouté');
    });
  }
}
