import { Component, OnInit } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';

@Component({
    selector: 'app-word-checking-dialog',
    templateUrl: './word-checking-dialog.component.html',
    styleUrls: ['./word-checking-dialog.component.scss'],
})
export class WordCheckingDialogComponent implements OnInit {
    word: string;
    isCorrect: boolean;
    constructor(private clientService: ClientSocketService) {
        this.word = '';
    }

    ngOnInit(): void {}

    checkWord(): void {
        this.clientService.socket.emit('checkWord', this.word);
    }
    receiveChecking(): void {
        this.clientService.socket.on('receiveChecking', (isCorrect) => {
            if (isCorrect) this.isCorrect = true;
            else {
                this.isCorrect = false;
            }
        });
    }
}
