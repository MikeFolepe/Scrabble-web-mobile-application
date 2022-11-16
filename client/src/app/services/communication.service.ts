import { HttpClient } from '@angular/common/http';
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
        return this.http.get<User[]>(`http://localhost:3000/api/user/users`);

    }

    checkPassword(pseudonym : string, password : string): Promise<Boolean> {
        return this.http.get<Boolean>(`http://localhost:3000/api/user/checkPassword/${pseudonym}/${password}`).toPromise();
    }

    checkPseudonym(pseudonym: string): Promise<Boolean> {
        return this.http.get<Boolean>(`http://localhost:3000/api/user/checkPseudonym/${pseudonym}`).toPromise();
    }
    
    //ICIIIII
    addNewUserToDB(userData: User): Observable<User> {
        console.log("test helloooooo hey ")
        return this.http.post<User>(`http://localhost:3000/api/user/users`, userData);
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
    connectUser(userData: User): Observable<User> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.post<User>(`${this.baseUrl}/auth/connect`, userData);
    }
}
