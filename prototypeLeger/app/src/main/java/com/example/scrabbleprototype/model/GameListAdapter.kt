package com.example.scrabbleprototype.model

import android.content.ClipData
import android.content.ClipDescription
import android.os.Build
import android.util.Log
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.cardview.widget.CardView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.Players
import com.example.scrabbleprototype.objects.Users
import org.w3c.dom.Text

class GameListAdapter(private var gameList: ArrayList<Room>) :
    RecyclerView.Adapter<GameListAdapter.ViewHolder>() {

    var onJoinGame: ((position: Int) -> Unit)? = null
    var onPreviewRoom: ((position: Int) -> Unit)? = null
    val currentUser = Users.currentUser

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val gameRoom: CardView

        init {
            // Define click listener for the ViewHolder's View.
            gameRoom = view.findViewById(R.id.game_room)
            val joinGameButton = view.findViewById<Button>(R.id.join_game_room_button)
            joinGameButton.setOnClickListener {
                onJoinGame?.invoke(layoutPosition)
            }

            val previewButton = view.findViewById<Button>(R.id.preview_players_list)
            previewButton.setOnClickListener {
                onPreviewRoom?.invoke(layoutPosition)
        }
    }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.game_room_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.gameRoom.findViewById<TextView>(R.id.room_name).text = gameList[position].gameSettings.creatorName
        val gameStatus = viewHolder.gameRoom.findViewById<TextView>(R.id.game_status)
        val roomType= viewHolder.gameRoom.findViewById<TextView>(R.id.room_type)
        viewHolder.gameRoom.findViewById<TextView>(R.id.minute).text = gameList[position].gameSettings.timeMinute
        viewHolder.gameRoom.findViewById<TextView>(R.id.seconde).text = gameList[position].gameSettings.timeSecond
        viewHolder.gameRoom.findViewById<TextView>(R.id.humans_number).text = "0" + gameList[position].humanPlayersNumber.toString()
        viewHolder.gameRoom.findViewById<TextView>(R.id.ai_number).text = "0" + gameList[position].aiPlayersNumber.toString()
        viewHolder.gameRoom.findViewById<TextView>(R.id.observer_number).text = gameList[position].observers.size.toString() + "/6"
        if(gameList[position].state == State.Playing || gameList[position].state == State.Finish) {
            gameStatus.text = "Indisponible"
            gameStatus.setTextColor(ContextCompat.getColor(gameStatus.context, R.color.red))
        } else {
            gameStatus.text = "En attente"
            gameStatus.setTextColor(ContextCompat.getColor(gameStatus.context, R.color.lime_green))
        }
        if(gameList[position].gameSettings.password == "" && gameList[position].gameSettings.type == RoomType.public.ordinal) {
            roomType.text = "Public"
            roomType.setTextColor(ContextCompat.getColor(roomType.context, R.color.lime_green))
        } else if(gameList[position].gameSettings.type == RoomType.private.ordinal) {
            roomType.text = "Priv??e"
            roomType.setTextColor(ContextCompat.getColor(roomType.context, R.color.red))
        }
        else {
            roomType.text = "Publique avec mot de passe"
            roomType.setTextColor(ContextCompat.getColor(roomType.context, R.color.red))
        }
        val joinGameButton = viewHolder.gameRoom.findViewById<Button>(R.id.join_game_room_button)
        if(gameList[position].state == State.Playing && gameList[position].gameSettings.type == RoomType.public.ordinal){
            joinGameButton.text ="Observer"
        } else {
            joinGameButton.text = joinGameButton.context.getString(R.string.join_game_item)
        }
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = gameList.size

    fun updateData(newGameList: ArrayList<Room>) {
        gameList = newGameList
        this.notifyDataSetChanged()
    }

}
