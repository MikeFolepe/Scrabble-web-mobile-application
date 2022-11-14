export class User {
    pseudonym: string;
    ipAddress: string;
    socketId: string;
    isObserver: boolean;
    constructor(pseudo: string, ipAddress: string, socketId: string = '', isObserver: boolean = false) {
        this.pseudonym = pseudo;
        this.ipAddress = ipAddress;
        this.socketId = socketId;
        this.isObserver = isObserver;
    }
}
