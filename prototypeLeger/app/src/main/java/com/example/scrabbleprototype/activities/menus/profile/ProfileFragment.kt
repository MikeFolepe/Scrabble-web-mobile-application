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
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentFeaturesBinding
import com.example.scrabbleprototype.databinding.FragmentHomeBinding
import com.example.scrabbleprototype.databinding.FragmentProfileBinding
import com.example.scrabbleprototype.databinding.FragmentSettingsBinding
import com.example.scrabbleprototype.model.*
import com.example.scrabbleprototype.objects.CurrentRoom
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Themes
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.InvitationViewModel
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.lang.Exception
import java.util.*
import kotlin.collections.ArrayList
import kotlin.concurrent.timerTask
import kotlin.coroutines.CoroutineContext
import androidx.lifecycle.Observer

class ProfileFragment : Fragment(), CoroutineScope {

    private val user = Users
    private lateinit var addFriendDialog: Dialog
    private var users = arrayListOf<User>()
    private lateinit var userAdapter: UserAdapter
    private lateinit var invitationAdapter: FriendInvitationAdapter
    private lateinit var friendsListAdapter: FriendsListAdapter

    private val invitationViewModel: InvitationViewModel by activityViewModels()
    private lateinit var binding: FragmentProfileBinding
    private var client = HttpClient() {
        install(ContentNegotiation) {}
    }
    private var job: Job = Job()
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + job

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        invitationViewModel.getFriendsAndInvites()
        val profileObserver = Observer<Boolean> { isProfilInit ->
            if(isProfilInit) {
                setupFriendsList()
                setupInvitations()
            }
        }
        invitationViewModel.isProfilInit.observe(viewLifecycleOwner, profileObserver)
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentProfileBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        setupUserInfo()
        setupAddFriendButton()
        receiveFriendRequest()

        super.onViewCreated(view, savedInstanceState)
    }

    private fun setupUserInfo() {
        binding.userPseudonym.text = user.currentUser.pseudonym
        binding.userXp.text = getString(R.string.user_xp, user.currentUser.xpPoints)
        binding.userAvatar.setImageBitmap(user.avatarBmp)
    }

    private fun setupFriendsList() {
        val friendsListView = binding.friendsList
        friendsListView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        friendsListAdapter = FriendsListAdapter(user.currentUser.friends)
        friendsListView.adapter = friendsListAdapter
    }

    private fun setupInvitations() {
        val invitationsView = binding.invitationsList
        invitationsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
        invitationAdapter = FriendInvitationAdapter(user.currentUser.invitations)
        invitationsView.adapter = invitationAdapter

        invitationAdapter.onAccept = { position ->
            acceptInvite(position)
        }
        invitationAdapter.onDecline = { position ->
            declineInvite(position)
        }
    }

    private fun setupAddFriendDialog() {
        addFriendDialog = Dialog(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
        addFriendDialog.setContentView(R.layout.add_friend_dialog)

        val usersView = addFriendDialog.findViewById<RecyclerView>(R.id.users)
        usersView.layoutManager = LinearLayoutManager(this.requireContext(), LinearLayoutManager.VERTICAL, false)
        userAdapter = UserAdapter(users)
        usersView.adapter = userAdapter

        userAdapter.onUserClick = { position ->
            if(users[position].invitations.any { it.pseudonym == Users.currentUser.pseudonym }) {
                Toast.makeText(addFriendDialog.context, "Cet utilisateur d??tient d??j?? une invitation de votre part en attente", Toast.LENGTH_LONG).show()
            } else if(Users.currentUser.invitations.any { it.pseudonym == users[position].pseudonym }){
                Toast.makeText(addFriendDialog.context, "Vous avez d??j?? une invitation en attente de cet utilisateur", Toast.LENGTH_LONG).show()
            } else {
                SocketHandler.socket.emit("sendFriendRequest", JSONObject(Json.encodeToString(Users.currentUser)), JSONObject(Json.encodeToString(users[position])))
                Toast.makeText(addFriendDialog.context, "Une invitation d'ami a ??t?? envoy??e ?? " + users[position].pseudonym, Toast.LENGTH_LONG).show()
                Timer().schedule(timerTask {
                    addFriendDialog.dismiss()
                }, 200)
            }
        }

        val dismissButton = addFriendDialog.findViewById<Button>(R.id.dismiss_dialog_button)
        dismissButton.setOnClickListener {
            addFriendDialog.dismiss()
        }
    }

    private fun receiveFriendRequest() {
        SocketHandler.socket.on("receiveFriendRequest") { response ->
            Log.d("receive request", "RECEIVED")
            val sender = jacksonObjectMapper().readValue(response[0].toString(), Friend::class.java)
            user.currentUser.invitations.add(sender)
            activity?.runOnUiThread { invitationAdapter.updateData(user.currentUser.invitations) }
        }
    }

    private fun setupAddFriendButton() {
        setupAddFriendDialog()
        binding.addFriendButton.setOnClickListener {
            // update adapter and users
            launch { getAllUsers() }
            addFriendDialog.show()
        }
    }

    private fun acceptInvite(position: Int) {
        val currentUserAsFriend = Friend(Users.currentUser.pseudonym, Users.currentUser.avatar, Users.currentUser.xpPoints)
        SocketHandler.socket.emit("acceptFriendRequest", JSONObject(Json.encodeToString(currentUserAsFriend)),
                                  JSONObject(Json.encodeToString(Users.currentUser.invitations[position])))
        Users.currentUser.friends.add(Users.currentUser.invitations[position])
        Users.currentUser.invitations.removeAt(position)

        invitationAdapter.updateData(Users.currentUser.invitations)
        friendsListAdapter.updateData(Users.currentUser.friends)
    }

    private fun declineInvite(position: Int) {
        SocketHandler.socket.emit("declineFriendRequest", Users.currentUser.pseudonym, Users.currentUser.invitations[position].pseudonym)
        Users.currentUser.invitations.removeAt(position)
        invitationAdapter.updateData(Users.currentUser.invitations)
    }

    private suspend fun getAllUsers() {
        var response: HttpResponse?
        try{
            response = client.get(environments.Environment.serverUrl + "/api/user/users") {}
        } catch(e: Exception) {
            response = null
            Log.d("users", "null")
        }
        if(response != null) {
            users = jacksonObjectMapper().readValue(response.body() as String, object : TypeReference<ArrayList<User>>() {})
            users.removeAll { it.pseudonym == Users.currentUser.pseudonym }
            for(friend in Users.currentUser.friends) {
                users.removeAll { it.pseudonym == friend.pseudonym }
            }
            activity?.runOnUiThread {
                Log.d("users", users.size.toString())
                userAdapter.updateData(users)
            }
        }
    }
}
