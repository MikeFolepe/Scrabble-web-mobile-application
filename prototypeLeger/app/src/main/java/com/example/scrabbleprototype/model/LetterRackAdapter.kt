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
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import org.w3c.dom.Text

class LetterRackAdapter(private var letterRack: ArrayList<Letter>) :
    RecyclerView.Adapter<LetterRackAdapter.ViewHolder>() {

    var onLetterClick: ((position: Int) -> Unit)? = null

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val letter: TextView
        val letterScore: TextView

        init {
            // Define click listener for the ViewHolder's View.
            letter = view.findViewById(R.id.letter)
            letterScore = view.findViewById(R.id.letter_score)
            view.setOnClickListener {
                onLetterClick?.invoke(layoutPosition)
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.letter_rack_item, viewGroup, false)

        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.letter.text = letterRack[position].value
        viewHolder.letterScore.text = letterRack[position].points.toString()

        viewHolder.itemView.setOnLongClickListener { v ->
            val letterTouched = ClipData.Item(letterRack[viewHolder.layoutPosition].value)
            val letterQuantity = ClipData.Item(letterRack[viewHolder.layoutPosition].quantity.toString())
            val letterScore = ClipData.Item(letterRack[viewHolder.layoutPosition].points.toString())
            val positionTouched = ClipData.Item(viewHolder.layoutPosition.toString())
            val dragData = ClipData(
                letterRack[viewHolder.layoutPosition].value,
                arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN),
                letterTouched
            )
            dragData.addItem(letterQuantity)
            dragData.addItem(letterScore)
            dragData.addItem(positionTouched)

            val shadowBuilder: View.DragShadowBuilder = View.DragShadowBuilder(v)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                v?.startDragAndDrop(dragData, shadowBuilder, null, 0)
            } else {
                v?.startDrag(dragData, shadowBuilder, null, 0)
            }
            true
        }
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = letterRack.size

    fun updateData(newLetterRack: ArrayList<Letter>) {
        letterRack = newLetterRack
        this.notifyDataSetChanged()
    }

}
