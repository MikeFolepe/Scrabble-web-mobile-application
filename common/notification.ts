

export class Notification {
    type: number;
    sender: string;
    description: string;
    title: string;
    date: string;
    time: string;

    constructor(type: number, sender: string, description: string) {
        this.type = type;
        this.sender = sender;
        this.description = description;
        switch(type) {
            case 0: {
                this.title = "Invitation d'ami";
                break;
            }
            case 1: {
                this.title = "Nouveau message";
                break;
            }
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