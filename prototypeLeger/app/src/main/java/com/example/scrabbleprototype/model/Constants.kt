package com.example.scrabbleprototype.model

import com.example.scrabbleprototype.objects.LetterRack

object Constants {
    val BOARD_HEIGHT = 15
    val BOARD_CENTER = 112
    val BOARD_SIZE = 225
    val LAST_BOARD_POSITION = 224
    val RACK_SIZE = 7

    val MAX_OPPONENTS = 3
    val MAX_PLAYERS = 4

    val EMPTY_LETTER = Letter("", 0, 0, false, false)

    val RESERVE = arrayOf(
        Letter("A", 9, 1, false, false),
        Letter("B", 2, 3, false, false),
        Letter("C", 2,3,false,false),
        Letter("D", 3, 2, false, false),
        Letter("E", 15, 1, false, false),
        Letter("F", 2, 4, false, false),
        Letter("G", 2, 2, false, false),
        Letter("H", 2, 4, false, false),
        Letter("I", 8, 1, false, false),
        Letter("J", 1, 8, false, false),
        Letter("K", 1, 10, false, false),
        Letter("L", 5, 1, false, false),
        Letter("M", 3, 2, false, false),
        Letter("N", 6, 1, false, false),
        Letter("O", 6, 1, false, false),
        Letter("P", 2, 3, false, false),
        Letter("Q", 1, 8, false, false),
        Letter("R", 6, 1, false, false),
        Letter("S", 6, 1, false, false),
        Letter("T", 6, 1, false, false),
        Letter("U", 6, 1, false, false),
        Letter("V", 2, 4, false, false),
        Letter("W", 1, 10, false, false),
        Letter("X", 1, 10, false, false),
        Letter("Y", 1, 10, false, false),
        Letter("Z", 1, 10, false, false),
        Letter("*", 2, 0, false, false)
    );

    val BONUS_POSITIONS = mapOf<Int, String>(
        (0 to "tripleWord"),
        (3 to "doubleLetter"),
        (7 to "tripleWord"),
        (11 to "doubleLetter"),
        (14 to "tripleWord"),
        (16 to "doubleWord"),
        (20 to "tripleLetter"),
        (24 to "tripleLetter"),
        (28 to "doubleWord"),
        (32 to "doubleWord"),
        (36 to "doubleLetter"),
        (38 to "doubleLetter"),
        (42 to "doubleWord"),
        (45 to "doubleLetter"),
        (48 to "doubleWord"),
        (52 to "doubleLetter"),
        (56 to "doubleWord"),
        (59 to "doubleLetter"),
        (64 to "doubleWord"),
        (70 to "doubleWord"),
        (76 to "tripleLetter"),
        (80 to "tripleLetter"),
        (84 to "tripleLetter"),
        (88 to "tripleLetter"),
        (92 to "doubleLetter"),
        (96 to "doubleLetter"),
        (98 to "doubleLetter"),
        (102 to "doubleLetter"),
        (105 to "tripleWord"),
        (108 to "doubleLetter"),
        (116 to "doubleLetter"),
        (119 to "tripleWord"),
        (122 to "doubleLetter"),
        (126 to "doubleLetter"),
        (128 to "doubleLetter"),
        (132 to "doubleLetter"),
        (136 to "tripleLetter"),
        (140 to "tripleLetter"),
        (144 to "tripleLetter"),
        (148 to "tripleLetter"),
        (154 to "doubleWord"),
        (160 to "doubleWord"),
        (165 to "doubleLetter"),
        (168 to "doubleWord"),
        (172 to "doubleLetter"),
        (176 to "doubleWord"),
        (179 to "doubleLetter"),
        (182 to "doubleWord"),
        (186 to "doubleLetter"),
        (188 to "doubleLetter"),
        (192 to "doubleWord"),
        (196 to "doubleWord"),
        (200 to "tripleLetter"),
        (204 to "tripleLetter"),
        (208 to "doubleWord"),
        (210 to "tripleWord"),
        (213 to "doubleLetter"),
        (217 to "tripleWord"),
        (221 to "doubleLetter"),
        (224 to "tripleWord")
    )
}

