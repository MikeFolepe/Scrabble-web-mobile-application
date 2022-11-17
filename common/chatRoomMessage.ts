
export enum MessageType {
    System,
    Opponent,
    Player,
    Error,
}

export class ChatRoomMessage {
    type : MessageType;
    time: string;

    constructor(public text : string, public avatar : string, public pseudonym : string) {
        console.log('construct');
        this.time =
        new Date().getHours().toString().padStart(2, '0') +
        ':' +
        new Date().getMinutes().toString().padStart(2, '0') +
        ':' +
        new Date().getSeconds().toString().padStart(2, '0');
    }

}

