package com.example.scrabbleprototype.model


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.Users


class GameHistoryAdapter(private var games: ArrayList<Game>) :
    RecyclerView.Adapter<GameHistoryAdapter.ViewHolder>() {

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val id = view.findViewById<TextView>(R.id.game_id)
        val date = view.findViewById<TextView>(R.id.game_date)
        val time = view.findViewById<TextView>(R.id.game_time)
        val result = view.findViewById<TextView>(R.id.game_result)
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.game_history_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.id.text = (position + 1).toString()
        viewHolder.date.text = games[position].startDate
        viewHolder.time.text = games[position].startTime
        if(games[position].winnerName == Users.currentUser.pseudonym) {
            viewHolder.result.text = viewHolder.result.context.getString(R.string.game_victory)
            viewHolder.result.setTextColor(ContextCompat.getColor(viewHolder.result.context, R.color.lime_green))
        }
        else {
            viewHolder.result.text = viewHolder.result.context.getString(R.string.game_defeat)
            viewHolder.result.setTextColor(ContextCompat.getColor(viewHolder.result.context, R.color.red))
        }
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = games.size

    fun updateData(newGames: ArrayList<Game>) {
        games = newGames
        this.notifyDataSetChanged()
    }

}
