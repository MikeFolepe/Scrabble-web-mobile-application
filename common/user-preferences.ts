export enum Language {
    French,
    English

}

export class Item{
    constructor(public name:string, public price: number, public theme: string,public description: string =''){}
}


export interface UserPreferences {

    appThemeSelected: string;
    boardItems: Item[];
    boardItemSelected: Item;
    chatItems: Item[];
    chatItemSelected: Item;
    language: Language;

}
