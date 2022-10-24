package com.example.scrabbleprototype.model

import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {

    lateinit var socket: Socket

    @Synchronized
    fun setPlayerSocket(serverIp: String) {
        try {
// "http://10.0.2.2:3000" --> emulator http://10.0.2.2:3000
//  physical phone/tablet --> ip address plus :3000
            socket = IO.socket(serverIp + "/game-handler")
        } catch (e: URISyntaxException) {

        }
    }

    @Synchronized
    fun getPlayerSocket(): Socket {
        return socket
    }

    @Synchronized
    fun establishConnection() {
        socket.connect()
    }

    @Synchronized
    fun closeConnection() {
        socket.disconnect()
    }
}
