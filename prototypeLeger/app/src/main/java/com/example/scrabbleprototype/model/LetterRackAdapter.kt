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

        init {
            // Define click listener for the ViewHolder's View.
            letter = view.findViewById(R.id.letter)
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


        view.setOnTouchListener(object : View.OnTouchListener {
            override fun onTouch(v: View?, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        //val data: ClipData = ClipData.newPlainText("", "")
                        val letterTouched = v?.findViewById<TextView>(R.id.letter)?.text
                        Log.d("dragdrop", letterTouched.toString())
                        val item = ClipData.Item(letterTouched)
                        val dragData = ClipData(letterTouched, arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN), item)

                        val shadowBuilder: View.DragShadowBuilder = View.DragShadowBuilder(v)

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            v?.startDragAndDrop(dragData, shadowBuilder, null, 0)
                        } else {
                            v?.startDrag(dragData, shadowBuilder, null, 0)
                        }
                        return true
                    }
                }
                return false
            }
        })
        return ViewHolder(view)
    }

    // Replace the contents of a view (invoked by the layout manager)
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {

        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.letter.text = letterRack[position].value.toString()
    }

    // Return the size of your dataset (invoked by the layout manager)
    override fun getItemCount() = letterRack.size

    fun updateData(newLetterRack: ArrayList<Letter>) {
        letterRack = newLetterRack
        this.notifyDataSetChanged()
    }

}
