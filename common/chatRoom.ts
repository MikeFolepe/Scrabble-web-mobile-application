
export class chatRoom {
    id: string;
    socketIds: string[];
    nbOfPlayer: number;

    constructor(roomId: string, socketId: string) {
        this.id = roomId;
        this.socketIds = [];
    }
    addSocketId(socketId: String){
        
    }
}
