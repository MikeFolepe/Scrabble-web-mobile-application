package com.example.scrabbleprototype.activities

/*class ChannelsListDialogActivity: DialogFragment() {
    val chatRooms: ChatRoom[] = [];

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstance: Bundle?
    ): View? {
        var rootView: View = inflater.inflate(R.layout.channels_list_dialog, container, false)

        return rootView
    }

    constructor(public clientSocketService: ClientSocketService) {
        this.clientSocketService.socket.on('updateChatRooms', (chatRooms: ChatRoom[]) => {
            this.chatRooms = chatRooms;
            this.scrollDown();
        });

        this.clientSocketService.socket.on('newChatRoom', (chatRoom: ChatRoom) => {
            this.chatRooms.push(chatRoom);
        });
    }

    displayBound(fn: () => void) {
        this.scrollDown = fn;
    }

    getChatRooms() {
        this.clientSocketService.socket.emit('getChatRooms');
    }
}
*/
