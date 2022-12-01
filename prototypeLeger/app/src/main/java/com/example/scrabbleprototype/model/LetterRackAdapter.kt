package com.example.scrabbleprototype.model

import android.content.ClipData
import android.content.ClipDescription
import android.content.Context
import android.graphics.Canvas
import android.graphics.Point
import android.os.Build
import android.util.Log
import android.view.*
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.cardview.widget.CardView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.objects.Players
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import org.w3c.dom.Text
import java.lang.Math.abs
import kotlin.coroutines.CoroutineContext

class LetterRackAdapter(private var letterRack: ArrayList<Letter>) :
    RecyclerView.Adapter<LetterRackAdapter.ViewHolder>() {

    var onLetterClick: ((position: Int) -> Unit)? = null
    var onLetterDrag: (() -> Unit)? = null

    private var job: Job = Job()
    val coroutineContext: CoroutineContext
        get() = Dispatchers.Main + job

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val letterLayout: CardView
        val letter: TextView
        val letterScore: TextView

        init {
            // Define click listener for the ViewHolder's View.
            letterLayout = view.findViewById(R.id.letter_layout)
            letter = view.findViewById(R.id.letter)
            letterScore = view.findViewById(R.id.letter_score)
            itemView.setOnClickListener {
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
        viewHolder.letterScore.text = letterRack[position].points.toString()
        viewHolder.letter.text = letterRack[position].value.uppercase()
        setupTouchListener(viewHolder)
        viewHolder.itemView.setOnClickListener {
            onLetterClick?.invoke(position)
        }
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = letterRack.size

    private fun setupTouchListener(viewHolder: ViewHolder) {
        var shouldClick = true
        viewHolder.itemView.setOnTouchListener { v, e ->
            when (e.action) {
                MotionEvent.ACTION_DOWN -> {
                    shouldClick = true
                    return@setOnTouchListener shouldClick
                }
                MotionEvent.ACTION_UP -> {
                    if(shouldClick) v.performClick()
                    return@setOnTouchListener false
                }
                MotionEvent.ACTION_MOVE -> {
                    if(abs(e.x) > 60 || abs(e.y) > 60) {
                        shouldClick = false
                        return@setOnTouchListener startDrag(v, viewHolder)
                    }
                    return@setOnTouchListener true
                }
            }
            true
        }
    }

    private fun startDrag(v: View, viewHolder: ViewHolder): Boolean {
        if(!Players.currentPlayer.getTurn()) return false

        // Cancel current swap
        onLetterDrag?.invoke()

        val letterTouched = ClipData.Item(letterRack[viewHolder.layoutPosition].value)
        val letterQuantity = ClipData.Item(letterRack[viewHolder.layoutPosition].quantity.toString())
        val letterScore = ClipData.Item(letterRack[viewHolder.layoutPosition].points.toString())
        val positionTouched = ClipData.Item(viewHolder.layoutPosition.toString())
        val isDraggedFromRack = ClipData.Item(true.toString())
        val dragData = ClipData(
            letterRack[viewHolder.layoutPosition].value,
            arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN),
            letterTouched
        )
        dragData.addItem(letterQuantity)
        dragData.addItem(letterScore)
        dragData.addItem(positionTouched)
        dragData.addItem(isDraggedFromRack)

        val shadowBuilder: View.DragShadowBuilder = View.DragShadowBuilder(v.findViewById<LinearLayout>(R.id.letter_to_drag))
        Log.d("drag", "starting drag")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            v.startDragAndDrop(dragData, shadowBuilder, null, 0)
        } else {
            v.startDrag(dragData, shadowBuilder, null, 0)
        }
        return true
    }

    fun updateData(newLetterRack: ArrayList<Letter>) {
        letterRack = newLetterRack
        this.notifyDataSetChanged()
    }

}
