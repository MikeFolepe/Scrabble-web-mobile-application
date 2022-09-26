package com.example.scrabbleprototype.model

import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {

    lateinit var chatSocket: Socket

    @Synchronized
    fun setSocket(serverIp: String) {
        try {
// "http://10.0.2.2:3000" --> emulator http://10.0.2.2:3000
//  physical phone/tablet --> ip address plus :3000
            chatSocket = IO.socket(serverIp)
        } catch (e: URISyntaxException) {

        }
    }

    @Synchronized
    fun getSocket(): Socket {
        return chatSocket
    }

    @Synchronized
    fun establishConnection() {
        chatSocket.connect()
    }

    @Synchronized
    fun closeConnection() {
        chatSocket.disconnect()
    }
}
