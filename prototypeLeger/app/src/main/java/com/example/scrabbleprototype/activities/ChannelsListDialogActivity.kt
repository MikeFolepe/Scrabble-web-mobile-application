package com.example.scrabbleprototype.activities

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import com.example.scrabbleprototype.R

class ChannelsListDialogActivity: DialogFragment() {
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstance: Bundle?
    ): View? {
        var rootView: View = inflater.inflate(R.layout.channels_list_dialog, container, false)

        return rootView
    }
}
