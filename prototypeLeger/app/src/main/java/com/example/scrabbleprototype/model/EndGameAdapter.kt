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
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.cardview.widget.CardView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.Players
import org.w3c.dom.Text

class EndGameAdapter(private var players: ArrayList<Player>) :
    RecyclerView.Adapter<EndGameAdapter.ViewHolder>() {

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val position: TextView
        val name: TextView
        val score: TextView

        init {
            position = view.findViewById(R.id.player_position)
            name = view.findViewById(R.id.player_name)
            score = view.findViewById(R.id.player_score)
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.item_endgame_player, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.position.text = (position + 1).toString()
        viewHolder.name.text = players[position].name
        viewHolder.score.text = players[position].score.toString()

    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = players.size

    fun updateData(newPlayers: ArrayList<Player>) {
        players = newPlayers
        this.notifyDataSetChanged()
    }

}
