package com.example.scrabbleprototype.model


import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R


class StoreItemsAdapter(private var items: ArrayList<Item>) :
    RecyclerView.Adapter<StoreItemsAdapter.ViewHolder>() {

    var onItemClick: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val itemName: TextView
        val itemPreview: ImageView
        val itemDescription: TextView
        val itemPrice: TextView

        init {
            itemName = view.findViewById(R.id.item_name)
            itemPreview = view.findViewById(R.id.item_color)
            itemDescription = view.findViewById(R.id.item_description)
            itemPrice = view.findViewById(R.id.item_price)
            itemPrice.setOnClickListener {
                onItemClick?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.store_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.itemName.text = items[position].name
        viewHolder.itemPreview.setImageResource(items[position].theme)
        viewHolder.itemDescription.text = items[position].description
        viewHolder.itemPrice.text = viewHolder.itemPrice.context.getString(R.string.purchase_btn, items[position].price)
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = items.size

    fun updateData(newItems: ArrayList<Item>) {
        items = newItems
        this.notifyDataSetChanged()
    }

}

