import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AiPlayer, AiPlayerDB, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { User } from '@common/user';
import { GameDB, UserStatsDB } from '@common/user-stats';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    baseUrl: string;
    private wordsToValidate: string[];

    constructor(private readonly http: HttpClient) {
        this.wordsToValidate = [];
    }

    validationPost(newPlayedWords: Map<string, string[]>, fileName: string): Observable<boolean> {
        this.wordsToValidate = [];
        for (const word of newPlayedWords.keys()) {
            this.wordsToValidate.push(word);
        }
        return this.http.post<boolean>(`${this.baseUrl}/game/validateWords/${fileName}`, this.wordsToValidate);
    }

    getGameDictionary(fileName: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/game/dictionary/${fileName}`);
    }

    getAiPlayers(aiType: AiType): Observable<AiPlayerDB[]> {
        return this.http.get<AiPlayerDB[]>(`${this.baseUrl}/admin/` + (aiType === AiType.expert ? 'aiExperts' : 'aiBeginners'));
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/user/users`);
    }

    updateGamesWon(userId: string, gamesWon: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/user/userStats/gamesWon/${userId}`, { gamesWon });
    }

    updateGamesPlayed(userId: string, gamesPlayed: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/user/userStats/gamesPlayed/${userId}`, { gamesPlayed });
    }

    updateTotalPoints(userId: string, totalPoints: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/user/userStats/totalPoints/${userId}`, { totalPoints });
    }

    updateXps(userId: string, xpPoints: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/user/users/xpPoints/${userId}`, { xpPoints });
    }

    getUserStats(userId: string): Observable<UserStatsDB> {
        return this.http.get<UserStatsDB>(`${this.baseUrl}/user/userStats/${userId}`);
    }

    addLogin(userId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/user/userStats/login/${userId}`, {});
    }

    addNewGameToStats(game: GameDB, userId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/user/userStats/game/${userId}`, game);
    }

    getAppTheme(userId: string): Observable<string> {
        return this.http.get(`${this.baseUrl}/user/preference/appTheme/${userId}`, { responseType: 'text' });
    }

    getCurrentBoard(userId: string): Observable<string> {
        return this.http.get(`${this.baseUrl}/user/preference/boardTheme/${userId}`, { responseType: 'text' });
    }

    getCurrentChat(userId: string): Observable<string> {
        return this.http.get(`${this.baseUrl}/user/preference/chatTheme/${userId}`, { responseType: 'text' });
    }

    getBoards(userId: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/user/preference/boards/${userId}`);
    }

    getChats(userId: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/user/preference/chats/${userId}`);
    }

    getLanguage(userId: string): Observable<string> {
        return this.http.get(`${this.baseUrl}/user/preference/language/${userId}`, { responseType: 'text' });
    }

    updateLanguage(userId: string, language: number): Observable<string> {
        return this.http.post(`${this.baseUrl}/user/preference/setLanguage/${userId}`, { language }, { responseType: 'text' });
    }

    addBoardTheme(userId: string, name: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/user/preference/addBoard/${userId}`, { name });
    }

    addChatTheme(userId: string, name: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/user/preference/addChat/${userId}`, { name });
    }

    updateUser(user: User, pseudonymChanged: boolean): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}/user/updateUser/${pseudonymChanged}`, user);
    }

    async findUserInDb(pseudonym: string, password: string): Promise<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/user/findUserInDb/${pseudonym}/${password}`).toPromise();
    }

    async checkPseudonym(pseudonym: string): Promise<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/user/checkPseudonym/${pseudonym}`).toPromise();
    }

    async getEmail(pseudonym: string): Promise<string> {
        return this.http.get(`${this.baseUrl}/user/getEmail/${pseudonym}`, { responseType: 'text' }).toPromise();
    }

    async sendEmailToUser(pseudonym: string): Promise<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/user/sendEmailToUser/${pseudonym}`).toPromise();
    }

    async getDecryptedPassword(pseudonym: string): Promise<string> {
        return this.http.get(`${this.baseUrl}/user/getDecryptedPassword/${pseudonym}`, { responseType: 'text' }).toPromise();
    }

    addNewUserToDB(userData: User): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}/user/users`, userData);
    }

    addAiPlayer(aiPlayer: AiPlayer, aiType: AiType): Observable<AiPlayerDB> {
        return this.http.post<AiPlayerDB>(`${this.baseUrl}/admin/aiPlayers`, { aiPlayer, aiType });
    }

    checkingWord(word: string, dictionary: string): Observable<HttpResponse<void>> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.get<void>(`${this.baseUrl}/game/dictionaryVerif/${word}/${dictionary}`, { observe: 'response' });
    }

    deleteAiPlayer(id: string, aiType: AiType): Observable<AiPlayerDB[]> {
        return this.http.delete<AiPlayerDB[]>(`${this.baseUrl}/admin/` + (aiType === AiType.expert ? `aiExperts/${id}` : `aiBeginners/${id}`));
    }

    deleteScores(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/admin/scores`);
    }

    updateAiPlayer(id: string, aiBeginner: AiPlayer, aiType: AiType): Observable<AiPlayerDB[]> {
        return this.http.put<AiPlayerDB[]>(`${this.baseUrl}/admin/aiPlayers/${id}`, { aiBeginner, aiType });
    }

    uploadFile(file: File): Observable<string> {
        const formData: FormData = new FormData();
        formData.append('file', file);
        return this.http.post<string>(`${this.baseUrl}/admin/uploadDictionary`, formData);
    }

    getDictionaries(): Observable<Dictionary[]> {
        return this.http.get<Dictionary[]>(`${this.baseUrl}/admin/dictionaries`);
    }

    updateDictionary(dictionary: Dictionary): Observable<Dictionary[]> {
        return this.http.put<Dictionary[]>(`${this.baseUrl}/admin/dictionaries`, dictionary);
    }

    deleteDictionary(fileName: string): Observable<Dictionary[]> {
        return this.http.delete<Dictionary[]>(`${this.baseUrl}/admin/dictionaries/${fileName}`);
    }

    // JUSTIFICATION : Required as the server respond with an object containing the dictionary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    downloadDictionary(fileName: string): Observable<any> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.get<any>(`${this.baseUrl}/admin/download/${fileName}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectUser(userData: User): Observable<HttpResponse<User>> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.post<User>(`${this.baseUrl}/auth/connect`, userData, { observe: 'response' });
    }
}
