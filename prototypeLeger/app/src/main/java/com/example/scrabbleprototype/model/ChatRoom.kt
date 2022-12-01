package com.example.scrabbleprototype.model

import kotlinx.serialization.Serializable

@Serializable
class ChatRoom (var chatRoomId: String, var creator: User, var chatRoomName: String) {
    var users: ArrayList<User> = arrayListOf(creator)
    var currentMessage: ChatRoomMessage = ChatRoomMessage("", "", "")
    var messages: ArrayList<ChatRoomMessage> = arrayListOf()

    fun containsUser(user: User): Boolean {
        return users.any { it.pseudonym == user.pseudonym }
    }
}
