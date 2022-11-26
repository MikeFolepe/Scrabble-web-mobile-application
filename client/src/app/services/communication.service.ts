import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AiPlayer, AiPlayerDB, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { User } from '@common/user';
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

    async findUserInDb(pseudonym: string, password: string): Promise<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/user/findUserInDb/${pseudonym}/${password}`).toPromise();
    }

    async checkPseudonym(pseudonym: string): Promise<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/user/checkPseudonym/${pseudonym}`).toPromise();
    }

    async getEmail(pseudonym : string): Promise<string> {
        return this.http.get(`${this.baseUrl}/user/getEmail/${pseudonym}`, {responseType : 'text'}).toPromise();
    }

    async sendEmailToUser(pseudonym: string) : Promise<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/user/sendEmailToUser/${pseudonym}`).toPromise();
    }

    async getDecryptedPassword(pseudonym : string): Promise<string> {
        return this.http.get(`${this.baseUrl}/user/getDecryptedPassword/${pseudonym}`, {responseType : 'text'}).toPromise();
    }

    addNewUserToDB(userData: User): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}/user/users`, userData);
    }

    addAiPlayer(aiPlayer: AiPlayer, aiType: AiType): Observable<AiPlayerDB> {
        return this.http.post<AiPlayerDB>(`${this.baseUrl}/admin/aiPlayers`, { aiPlayer, aiType });
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
