
export enum MessageType {
    System,
    Opponent,
    Player,
    Error,
}

export class ChatRoomMessage {
    text : string;
    type : MessageType;
    avatar : string;
    pseudonym : string;

    constructor(text : string, avatar : string, pseudonym : string) {
        this.text = text; 
        this.avatar = avatar;
        this.pseudonym = pseudonym;
    }

}

