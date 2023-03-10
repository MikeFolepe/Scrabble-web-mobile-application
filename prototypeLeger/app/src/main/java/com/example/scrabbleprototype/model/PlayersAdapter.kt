package com.example.scrabbleprototype.model


import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.Users


class PlayersAdapter(private var players: ArrayList<Player>) :
    RecyclerView.Adapter<PlayersAdapter.ViewHolder>() {

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val player: ConstraintLayout

        init {
            player = view.findViewById(R.id.player_layout)
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.player_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        val playerName = viewHolder.player.findViewById<TextView>(R.id.player_name)
        playerName.text = players[position].name
        val playerScore = viewHolder.player.findViewById<TextView>(R.id.player_score)
        playerScore.text = players[position].score.toString()

        setupReplace(viewHolder, position)
    }

    private fun setupReplace(viewHolder:ViewHolder,  position: Int){
        val replaceButton = viewHolder.player.findViewById<Button>(R.id.button_replace)

        if(Users.currentUser.isObserver && players[position].isAi){
            if(players[position].getTurn()) replaceButton.visibility = View.GONE
            else replaceButton.visibility = View.VISIBLE
        }

        if(!Users.currentUser.isObserver) replaceButton.visibility = View.GONE

        replaceButton.setOnClickListener {
            Users.currentUser.isObserver = false
            SocketHandler.socket.emit("replaceAi", Users.currentUser.pseudonym, position, CurrentRoom.myRoom.id)
        }

    }



    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = players.size

    fun updateData(newPlayers: ArrayList<Player>) {
        players = newPlayers
        this.notifyDataSetChanged()
    }
}
