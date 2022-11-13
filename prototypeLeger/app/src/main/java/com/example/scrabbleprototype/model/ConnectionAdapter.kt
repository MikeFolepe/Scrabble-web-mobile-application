package com.example.scrabbleprototype.model


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R


class ConnectionAdapter(private var connections: ArrayList<Connection>) :
    RecyclerView.Adapter<ConnectionAdapter.ViewHolder>() {

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val id = view.findViewById<TextView>(R.id.connection_id)
        val title = view.findViewById<TextView>(R.id.connection_title)
        val date = view.findViewById<TextView>(R.id.connection_date)
        val time = view.findViewById<TextView>(R.id.connection_time)
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.connection_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.id.text = (position + 1).toString()
        if(connections[position].isLogin) viewHolder.title.text = viewHolder.title.context.getString(R.string.connection_item)
        else viewHolder.title.text =viewHolder.title.context.getString(R.string.logout_item)
        viewHolder.date.text = connections[position].date
        viewHolder.time.text = connections[position].time
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = connections.size

    fun updateData(newConnections: ArrayList<Connection>) {
        connections = newConnections
        this.notifyDataSetChanged()
    }

}
