package com.example.scrabbleprototype.model

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.LayoutRes
import com.example.scrabbleprototype.R

class ChatAdapter(context: Context, @LayoutRes private val layoutResource: Int, private var messages: List<ChatRoomMessage>):
    ArrayAdapter<ChatRoomMessage>(context, layoutResource, messages) {

    private var _messages: List<ChatRoomMessage> = messages

    override fun getCount(): Int {
        return _messages.size
    }

    override fun getItem(position: Int): ChatRoomMessage? {
        return _messages[position]
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        return createViewFromResource(position, convertView, parent)
    }

    override fun getDropDownView(position: Int, convertView: View?, parent: ViewGroup?): View {
        return createViewFromResource(position, convertView, parent)
    }

    private fun createViewFromResource(position: Int, convertView: View?, parent: ViewGroup?): View {

        val view: LinearLayout = if(convertView == null) {
            convertView as LinearLayout? ?: LayoutInflater.from(context).inflate(layoutResource, parent, false) as LinearLayout
        } else convertView as LinearLayout

        val messageUser = view.findViewById<TextView>(R.id.message_user)
        val messageTime = view.findViewById<TextView>(R.id.message_time)
        val message = view.findViewById<TextView>(R.id.message)
        val messageAvatar = view.findViewById<ImageView>(R.id.message_avatar)
        //imageview.setmageBitMap(_messages[position].getBitMap)


        messageAvatar.setImageBitmap(_messages[position].getAvatarBitmap())
        messageUser.text = _messages[position].pseudonym
        messageTime.text = _messages[position].time
        message.text = _messages[position].text

        return view
    }

    fun updateData(newMessages: List<ChatRoomMessage>) {
        this.messages = newMessages
        this._messages = newMessages
        notifyDataSetChanged()
    }
}
