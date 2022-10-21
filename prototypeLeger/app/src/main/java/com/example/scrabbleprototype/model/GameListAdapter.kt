package com.example.scrabbleprototype.model

import android.content.ClipData
import android.content.ClipDescription
import android.os.Build
import android.util.Log
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.cardview.widget.CardView
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import org.w3c.dom.Text

class GameListAdapter(private var gameList: ArrayList<Room>) :
    RecyclerView.Adapter<GameListAdapter.ViewHolder>() {

    var onGameClick: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val gameRoom: CardView

        init {
            // Define click listener for the ViewHolder's View.
            gameRoom = view.findViewById(R.id.game_room)
            view.setOnClickListener {
                onGameClick?.invoke(layoutPosition)
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
        viewHolder.gameRoom.findViewById<TextView>(R.id.room_name).text = gameList[position].id
        viewHolder.gameRoom.findViewById<TextView>(R.id.game_status).text = gameList[position].state.toString()
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = gameList.size

    fun updateData(newGameList: ArrayList<Room>) {
        gameList = newGameList
        this.notifyDataSetChanged()
    }

}