import { Item, Language, UserPreferences } from '@common/user-preferences';
import { galaxy, gradient, tartan } from '@common/themePics';
export class Themes {
    appThemes: string[];
    defaultItem: Item;
    boardItems: Item[];
    chatItems: Item[];

    constructor() {
        this.appThemes = ['Default', 'Dark', 'Blue', 'Orange'];
        this.defaultItem = new Item('Par défaut', 0, '', 'Composé de vert clair et de turquoise');
        this.boardItems = [
            {
                name: 'Gradients animés',
                price: 75,
                theme: gradient,
                description: '',
            },
            {
                name: 'Tartan',
                price: 50,
                theme: tartan,
                description: '',
            },
            {
                name: 'Galaxie',
                price: 50,
                theme: galaxy,
                description: '',
            },
        ];

        this.chatItems = [
            {
                name: 'Gradients animés',
                price: 75,
                theme: gradient,
                description: '',
            },
            {
                name: 'Galaxie',
                price: 50,
                theme: galaxy,
                description: '',
            },
        ];
    }

    getBoard(name: string): Item {
        return this.boardItems.find((curTheme) => curTheme.name === name) as Item;
    }

    getChat(name: string): Item {
        return this.chatItems.find((curTheme) => curTheme.name === name) as Item;
    }
}

export const DEFAULT_PREF: UserPreferences = {
    appThemeSelected: '',
    boardItems: [],
    boardItemSelected: new Item('Par défaut', 0, '', 'Composé de vert clair et de turquoise'),
    chatItems: [],
    chatItemSelected: new Item('Par défaut', 0, '', 'Composé de vert clair et de turquoise'),
    language: Language.French,
};
