import { Friend } from '@common/friend';

export class User {
    _id: string;
    pseudonym: string;
    avatar: string;
    password: string;
    email: string;
    socketId?: string;
    isObserver?: boolean;
    xpPoints: number;
    friends: Friend[];

    //ce qui est oblige : avatar, pseudonym, password, email

    constructor(avatar: string, pseudonym: string, password: string, email: string) {
        this.avatar = avatar;
        this.pseudonym = pseudonym;
        this.password = password;
        this.email = email;
        this.isObserver = false;
        this.socketId = '';
        this.xpPoints = 0;
        this.friends = [];
    }
}
