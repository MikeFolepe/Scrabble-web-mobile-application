
export enum NotifType {
    Friend,
    Game,
    Message,
}

export class Notification {
    type: NotifType;
    sender: string;
    description: string
    title: string
    date: string
    time: string

    constructor(type: NotifType, sender: string, description: string) {
        this.type = type;
        this.sender = sender;
        this.description = description;
        switch(type) {
            case NotifType.Friend: this.title = "Invitation d'ami";
            case NotifType.Game: this.title = "Invitation à une partie";
            case NotifType.Message: this.title = "Nouveau message";
        }
        this.date = this.getDateStamp()
        this.time = this.getTimeStamp()
    }

    getDateStamp(): string {
        const date = new Date();
        return (
            date.getFullYear().toString(),
            (date.getMonth() + 1).toString().padStart(2, '0'),
            (date.getDate().toString().padStart(2, '0'))
        );
    }

    getTimeStamp(): string {
        const date = new Date();
        return (
            date.getHours().toString().padStart(2, '0') +
            ':' +
            date.getMinutes().toString().padStart(2, '0') +
            ':' +
            date.getSeconds().toString().padStart(2, '0')
        );
    }
}