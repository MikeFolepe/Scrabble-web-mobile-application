package com.example.scrabbleprototype.activities.menus.store

import android.os.Bundle
import android.view.ContextThemeWrapper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scrabbleprototype.R
import com.example.scrabbleprototype.databinding.FragmentStoreBinding
import com.example.scrabbleprototype.model.Item
import com.example.scrabbleprototype.model.StoreItemsAdapter
import com.example.scrabbleprototype.objects.ThemeManager
import com.example.scrabbleprototype.objects.Themes
import com.example.scrabbleprototype.objects.Users
import com.example.scrabbleprototype.viewModel.PreferenceViewModel
import com.example.scrabbleprototype.viewModel.StatsViewmodel

class StoreFragment : Fragment() {

    private val usersPreferences = Users.userPreferences
    private val user = Users.currentUser

    private val preferenceViewModel: PreferenceViewModel by activityViewModels()
    private val statsViewModel: StatsViewmodel by activityViewModels()
    private lateinit var binding: FragmentStoreBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val inflaterWithTheme = ThemeManager.setFragmentTheme(layoutInflater, requireContext())
        binding = FragmentStoreBinding.inflate(inflaterWithTheme)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupXp()
        setupBoardItems()
        setupChatItems()
    }

    private fun setupXp() {
        binding.userXp.text = getString(R.string.user_xp, user.xpPoints)
    }

    private fun setupBoardItems() {
        val boardItemsView = binding.boardThemesStore
        boardItemsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        val boardItemsAdapter = StoreItemsAdapter(Themes.boardItems)
        boardItemsView.adapter = boardItemsAdapter

        boardItemsAdapter.onItemClick = { position ->
            showConfirmPurchaseDialog(Themes.boardItems[position], usersPreferences.boardItems, true)
        }
    }

    private fun setupChatItems() {
        val chatItemsView = binding.chatThemesStore
        chatItemsView.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        val chatItemsAdapter = StoreItemsAdapter(Themes.chatItems)
        chatItemsView.adapter = chatItemsAdapter

        chatItemsAdapter.onItemClick = { position ->
            showConfirmPurchaseDialog(Themes.chatItems[position], usersPreferences.chatItems, false)
        }
    }

    private fun buyItem(itemToBuy: Item, userItems: ArrayList<Item>, isBoard: Boolean) {
        if(userItems.any { it.name == itemToBuy.name }) {
            Toast.makeText(requireContext(), "Achat Impossible : Vous possédez déjà ce thème", Toast.LENGTH_LONG).show()
            return
        }
        if(user.xpPoints < itemToBuy.price) {
            Toast.makeText(requireContext(), "Achat Impossible : Vous n'avez pas assez de points pour acheter le thème", Toast.LENGTH_LONG).show()
            return
        }

        user.xpPoints -= itemToBuy.price
        statsViewModel.saveXp()
        setupXp()
        userItems.add(itemToBuy)
        if(isBoard) preferenceViewModel.saveBoughtBoard(itemToBuy)
        else preferenceViewModel.saveBoughtChat(itemToBuy)
        Toast.makeText(requireContext(), "Achat complété : Le thème a été ajouté à votre profil", Toast.LENGTH_LONG).show()
    }

    private fun showConfirmPurchaseDialog(item: Item, userItems: ArrayList<Item>, isBoard: Boolean) {
        val builder = AlertDialog.Builder(ContextThemeWrapper(requireContext(), ThemeManager.getTheme()))
        builder.setMessage("Veuillez confirmer l'achat du thème  : " + item.name)
            .setCancelable(false)
            .setPositiveButton("Confirmer") { dialog, id ->
                buyItem(item, userItems, isBoard)
                dialog.dismiss()
            }
            .setNegativeButton("Annuler") { dialog, id -> //  Action for 'NO' Button
                dialog.dismiss()
            }
        val alert: AlertDialog = builder.create()
        alert.setTitle("Confirmation d'achat")
        alert.show()
    }
}
