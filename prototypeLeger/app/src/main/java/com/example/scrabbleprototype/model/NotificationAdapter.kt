package com.example.scrabbleprototype.model


import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import org.w3c.dom.Text


class NotificationAdapter(private var notifications: ArrayList<Notification>) :
    RecyclerView.Adapter<NotificationAdapter.ViewHolder>() {

    var onNotifClick: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {

        val title = view.findViewById<TextView>(R.id.notification_title)
        val date = view.findViewById<TextView>(R.id.notification_date)
        val time = view.findViewById<TextView>(R.id.notification_time)
        val senderName = view.findViewById<TextView>(R.id.sender_name)
        val description = view.findViewById<TextView>(R.id.notification_description)

        init {
            view.findViewById<LinearLayout>(R.id.notification_layout).setOnClickListener {
                onNotifClick?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.notification_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.title.text = notifications[position].title
        viewHolder.date.text = notifications[position].date
        viewHolder.time.text = notifications[position].time
        viewHolder.senderName.text = viewHolder.itemView.context.getString(R.string.notif_sender, notifications[position].sender)
        viewHolder.description.text = notifications[position].description
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = notifications.size

    fun updateData(newNotifications: ArrayList<Notification>) {
        notifications = newNotifications
        this.notifyDataSetChanged()
    }
}
