export class User {
    _id?: string;
    pseudonym: string;
    ipAddress: string;
    socketId?: string;
    isObserver: boolean;
    avatar: string;
    password?: string;
    email?: string;

    //ce qui est oblige : avatar, pseudonym, password, email

    constructor(avatar: string, pseudonym: string, password: string, email: string, isObserver: boolean = false, socketId?: string) {
        this.avatar = avatar;
        this.pseudonym = pseudonym;
        this.password = password;
        this.email = email;
        this.socketId = socketId;
        this.isObserver = isObserver;
    }
}
