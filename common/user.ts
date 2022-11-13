export class User {
    id : string;
    ipAddress: string;
    avatar?: string;
    pseudonym: string;
    password?: string;
    email?: string;
    socketId?: string;

    //ce qui est oblige : avatar, pseudonym, password, email

    constructor(ipAddress: string, avatar : string, pseudonym: string, password : string, email :string,  socketId?: string) {
        this.ipAddress = ipAddress;
        this.avatar = avatar;
        this.pseudonym = pseudonym;
        this.password = password;
        this.email = email;
        this.socketId = socketId;
    }

}
