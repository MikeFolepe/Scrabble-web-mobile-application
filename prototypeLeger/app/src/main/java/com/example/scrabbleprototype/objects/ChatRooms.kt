package com.example.scrabbleprototype.objects

import androidx.lifecycle.MutableLiveData
import com.example.scrabbleprototype.model.ChatRoom

object ChatRooms {
    var chatRooms: ArrayList<ChatRoom> = arrayListOf()
    var myChatRooms: ArrayList<ChatRoom> = arrayListOf()
    var currentChatRoom: ChatRoom? = null
    var chatRoomToChange: MutableLiveData<String> = MutableLiveData("")

    fun getCurrentChatRoomIndex(): Int {
        return chatRooms.indexOfFirst { it.chatRoomId == currentChatRoom?.chatRoomId }
    }
}
