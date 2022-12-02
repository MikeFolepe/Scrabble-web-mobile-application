
export enum NotifType {
    Friend,
    Game,
    Message,
}

export class Notification {
    type: NotifType;
    sender: string;
    description: string;
    title: string;
    date: string;
    time: string;
    _id?: string;

    constructor(type: NotifType, sender: string, description: string) {
        this.type = type;
        this.sender = sender;
        this.description = description;
        switch(type) {
            case NotifType.Friend: this.title = "Invitation d'ami";
            case NotifType.Game: this.title = "Invitation à une partie";
            case NotifType.Message: this.title = "Nouveau message";
        }
        this.date = new Date().getFullYear().toString(),
        (new Date().getMonth() + 1).toString().padStart(2, '0'),
        (new Date().getDate().toString().padStart(2, '0'))

        this.time = new Date().getHours().toString().padStart(2, '0') +
        ':' +
        new Date().getMinutes().toString().padStart(2, '0') +
        ':' +
        new Date().getSeconds().toString().padStart(2, '0')
    }
}