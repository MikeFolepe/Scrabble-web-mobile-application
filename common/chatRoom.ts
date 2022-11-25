import { ChatRoomMessage } from './chatRoomMessage';
import { User } from './user';
export class ChatRoom {
    chatRoomName: string;
    users: User[] = [];
    currentMessage: ChatRoomMessage;
    messages: ChatRoomMessage[];
    creator: User;
    chatRoomId: string;

    constructor(roomId: string, creator: User, chatRoomName: string) {
        this.chatRoomId = roomId;
        this.users.push(creator);
        this.currentMessage = new ChatRoomMessage('', '', '');
        this.messages = [];
        this.creator = creator;
        this.chatRoomName = chatRoomName;
    }
}
