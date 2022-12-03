package com.example.scrabbleprototype.model

import android.content.ClipData
import android.content.ClipDescription
import android.graphics.BitmapFactory
import android.os.Build
import android.util.Base64
import android.util.Log
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
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

class PlayersWaitingAdapter(private var players: ArrayList<Player>) :
    RecyclerView.Adapter<PlayersWaitingAdapter.ViewHolder>() {

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val player: LinearLayout

        init {
            player = view.findViewById(R.id.player_waiting)
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.player_waiting_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        val playerName = viewHolder.player.findViewById<TextView>(R.id.player_name)
        val playerAvatar = viewHolder.player.findViewById<ImageView>(R.id.avatar)
        val split = players[position].avatar.split(",")
        val imageBytes = Base64.decode(split[1], Base64.NO_WRAP)
        val image = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
        playerAvatar.setImageBitmap(image)
        playerName.text = players[position].name
        if(players[position].isCreator) {
            viewHolder.player.findViewById<TextView>(R.id.creator).text = "Créateur : "
        }
        Log.d("waiting", players[position].name)
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = players.size

    fun updateData(newPlayers: ArrayList<Player>) {
        players = newPlayers
        this.notifyDataSetChanged()
    }

}
