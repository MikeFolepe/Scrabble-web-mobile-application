export class Message {
    messageTime: string;
    constructor(public message: string, public messageUser: string) {
        this.messageTime =
            new Date().getHours().toString().padStart(2, '0') +
            ':' +
            new Date().getMinutes().toString().padStart(2, '0') +
            ':' +
            new Date().getSeconds().toString().padStart(2, '0');
    }
}
