package com.example.scrabbleprototype.model

import android.content.ClipData
import android.content.ClipDescription
import android.os.Build
import android.util.Log
import android.view.*
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
            setupDragListener(view)
        }

        private fun setupDragListener(view: View) {
            // Drag listener for board cases
            view.setOnDragListener { v, e ->
                when(e.action) {
                    DragEvent.ACTION_DRAG_STARTED -> {
                        return@setOnDragListener e.clipDescription.hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN)
                    }
                    DragEvent.ACTION_DRAG_ENTERED -> {
                        // Can modify view here to show that the view is being dragged
                        true
                    }
                    DragEvent.ACTION_DRAG_EXITED -> {
                        // Modify view style back to DRAG_STARTED DragEvent
                        true
                    }
                    DragEvent.ACTION_DROP -> {
                        val letterTouched = e.clipData.getItemAt(0)
                        val letterQuantity: Int = e.clipData.getItemAt(1).text.toString().toInt()
                        val letterScore: Int = e.clipData.getItemAt(2).text.toString().toInt()
                        val positionTouched: Int = e.clipData.getItemAt(3).text.toString().toInt()
                        val dragData = letterTouched.text // La data de la lettre qui a été dragged

                        // Add letter dropped to board
                        letterRack[bindingAdapterPosition] = Letter(dragData.first().toString().lowercase(), letterQuantity, letterScore, false, false)
                        // Remove letter dragged of letterRack
                        //onPlacement?.invoke(positionTouched, bindingAdapterPosition)

                        notifyItemChanged(bindingAdapterPosition)
                        true
                    }
                    DragEvent.ACTION_DRAG_ENDED -> {
                        when(e.result) {
                            true ->
                                Toast.makeText(v.context, "DROP SUCCESSFUL", Toast.LENGTH_LONG)
                            else ->
                                Toast.makeText(v.context, "DROP DIDN'T WORK", Toast.LENGTH_LONG)
                        }.show()
                        true
                    }
                    else -> {
                        Log.d("dragdrop", "Unknown Action type received by the drag listener")
                        false
                    }
                }
            }
        }
    }

    // Create new views (invoked by the layout manager)
    override fun onCreateViewHolder(viewGroup: ViewGroup, viewType: Int): ViewHolder {
        // Create a new view, which defines the UI of the list item
        val view = LayoutInflater.from(viewGroup.context)
            .inflate(R.layout.letter_rack_item, viewGroup, false)
        Log.d("rack", "createview")
        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.letter.text = letterRack[position].value
        viewHolder.letterScore.text = letterRack[position].points.toString()
        setupTouchListener(viewHolder)
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = letterRack.size

    private fun setupTouchListener(viewHolder: ViewHolder) {
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

    fun updateData(newLetterRack: ArrayList<Letter>) {
        letterRack = newLetterRack
        this.notifyDataSetChanged()
    }

}
