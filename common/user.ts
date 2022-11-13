export class User {
    ipAddress: string;
    pseudonym: string;
    socketId?: string;


    constructor(ipAddress: string, pseudonym: string, socketId?: string) {
        this.ipAddress = ipAddress;
        this.pseudonym = pseudonym;
        this.socketId = socketId;
    }

}
