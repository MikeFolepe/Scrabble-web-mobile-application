package com.example.scrabbleprototype.activities.menus.profile

import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.ContextThemeWrapper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentHomeBinding
import com.example.scrabbleprototype.databinding.FragmentProfileBinding
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Themes
import com.example.scrabbleprototype.objects.Users
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import java.util.*
import kotlin.concurrent.timerTask

class ProfileFragment : Fragment() {

    private val user = Users.currentUser
    private lateinit var addFriendDialog: Dialog
    private var users = arrayListOf<Friend>()
    private lateinit var userAdapter: UserAdapter

    private lateinit var binding: FragmentProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        for(i in 0 until 12) {
            user.friendsList.add(Friend("ami #" + i, (R.color.blue).toString(), 250 + i))
            user.invitations.add(Friend("jacques", "", 23 + i))
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentProfileBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        receiveActiveUsers()
        setupUserInfo()
        setupFriendsList()
        setupInvitations()
        setupAddFriendButton()

        super.onViewCreated(view, savedInstanceState)
    }

    private fun receiveActiveUsers() {
        SocketHandler.socket.on("activeUsers") { response ->
            users = jacksonObjectMapper().readValue(response[0].toString(), object: TypeReference<ArrayList<Friend>>() {})
            Log.d("activeusers", "received")
        }
        SocketHandler.socket.emit("sendActiveUsers", user.pseudonym)
    }

    private fun setupUserInfo() {
        binding.userPseudonym.text = user.pseudonym
        binding.userXp.text = getString(R.string.user_xp, user.xpPoints)
    }

    private fun setupFriendsList() {
        val friendsListView = binding.friendsList
        friendsListView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        val friendsListAdapter = FriendsListAdapter(user.friendsList)
        friendsListView.adapter = friendsListAdapter
    }

    private fun setupInvitations() {
        val invitationsView = binding.invitationsList
        invitationsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        val invitationAdapter = FriendInvitationAdapter(user.invitations)
        invitationsView.adapter = invitationAdapter
    }

    private fun setupAddFriendDialog() {
        addFriendDialog = Dialog(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
        addFriendDialog.setContentView(R.layout.add_friend_dialog)

        val usersView = addFriendDialog.findViewById<RecyclerView>(R.id.users)
        usersView.layoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.VERTICAL, false)
        userAdapter = UserAdapter(users)
        usersView.adapter = userAdapter

        userAdapter.onUserClick = { position ->
            user.friendsList.add(users[position])
            // TODO send invitation
            Toast.makeText(addFriendDialog.context, "Une invitation d'ami a été envoyée à " + users[position].pseudonym, Toast.LENGTH_LONG).show()
            Timer().schedule(timerTask {
                addFriendDialog.dismiss()
            }, 200)
        }

        val dismissButton = addFriendDialog.findViewById<Button>(R.id.dismiss_dialog_button)
        dismissButton.setOnClickListener {
            addFriendDialog.dismiss()
        }
    }

    private fun setupAddFriendButton() {
        setupAddFriendDialog()
        binding.addFriendButton.setOnClickListener {
            // update adapter and users
            addFriendDialog.show()
        }
    }
}
