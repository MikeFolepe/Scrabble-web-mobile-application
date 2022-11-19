package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class ChatRoom (var id: String, var creator: User, var name: String) {
    var users: ArrayList<User> = arrayListOf<User>(creator)
    var currentMessage: ChatRoomMessage = ChatRoomMessage("", "", "")
    var messages: ArrayList<ChatRoomMessage> = arrayListOf<ChatRoomMessage>()
    var creatorName: String = creator.pseudonym
}
