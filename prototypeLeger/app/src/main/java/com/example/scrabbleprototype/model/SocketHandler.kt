package com.example.scrabbleprototype.model

import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {

    lateinit var playerSocket: Socket

    @Synchronized
    fun setPlayerSocket(serverIp: String) {
        try {
// "http://10.0.2.2:3000" --> emulator http://10.0.2.2:3000
//  physical phone/tablet --> ip address plus :3000
            playerSocket = IO.socket(serverIp + "/game-handler")
        } catch (e: URISyntaxException) {

        }
    }

    @Synchronized
    fun getPlayerSocket(): Socket {
        return playerSocket
    }

    @Synchronized
    fun establishConnection() {
        playerSocket.connect()
    }

    @Synchronized
    fun closeConnection() {
        playerSocket.disconnect()
    }

    @Synchronized
    fun establishConnection(){
        playerSocket.connect()
    }
}
