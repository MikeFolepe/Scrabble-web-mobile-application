package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class ChatRoom (var chatRoomId: String, var creator: User, var chatRoomName: String) {
    var users: ArrayList<User> = arrayListOf(creator)
    var currentMessage: ChatRoomMessage = ChatRoomMessage("", "", "")
    var messages: ArrayList<ChatRoomMessage> = arrayListOf()
    var creatorName: String = creator.pseudonym
}
