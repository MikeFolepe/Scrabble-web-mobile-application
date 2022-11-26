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

  addUserToDatabase(user: User) : void {
    this.addUser(user);   
  }

  async findUserInDb(pseudonym: string, password: string) : Promise<boolean> {
    return this.communicationService.findUserInDb(pseudonym, password);
  }

  async checkIfPseudonymExists(pseudonym: string) : Promise<boolean> {
      return this.communicationService.checkPseudonym(pseudonym);
  }

  async getEmail(pseudonym : string) : Promise<string> {
    return this.communicationService.getEmail(pseudonym);
  }

  async sendEmailToUser(pseudonym : string) : Promise<boolean> {
    return this.communicationService.sendEmailToUser(pseudonym);
  }

  async getDecryptedPassword(pseudonym : string) : Promise<string> {
    return this.communicationService.getDecryptedPassword(pseudonym);
  }

  private addUser(user: User) : void {
    this.communicationService.addNewUserToDB(user).subscribe(() => {
        this.administratorService.displayMessage('Utilisateur ajouté');
    });
  }
}
