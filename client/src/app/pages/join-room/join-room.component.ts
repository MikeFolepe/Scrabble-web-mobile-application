// JUSTIFICATION: The '_' are native to _MatPaginatorIntl attributes
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
import { ErrorMessage } from '@app/classes/error-message-constants';
import { Room, State } from '@app/classes/room';
import { NameSelectorComponent } from '@app/modules/initialize-game/name-selector/name-selector.component';
import { AuthService } from '@app/services/auth.service';
import { ClientSocketService } from '@app/services/client-socket.service';
import { PlayerService } from '@app/services/player.service';
import { MAX_LENGTH_OBSERVERS } from '@common/constants';
import { RoomType } from '@common/game-settings';

@Component({
    selector: 'app-join-room',
    templateUrl: './join-room.component.html',
    styleUrls: ['./join-room.component.scss'],
})
export class JoinRoomComponent implements OnInit {
    rooms: Room[];
    roomItemIndex: number;
    pageSize: number;
    shouldDisplayError: boolean;
    isRoomAvailable: boolean;
    isRandomButtonAvailable: boolean;
    errorMessage: string;
    maxObserversLength = MAX_LENGTH_OBSERVERS;
    // JUSTIFICATION : must name service as it is named in MatPaginatorIntl
    constructor(
        public clientSocketService: ClientSocketService,
        public dialog: MatDialog,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public _MatPaginatorIntl: MatPaginatorIntl,
        private authService: AuthService,
        private router: Router,
        public playerService: PlayerService,
        public snackBar: MatSnackBar,
    ) {
        this.rooms = [];
        this.roomItemIndex = 0;
        // 2 rooms per page
        this.pageSize = 2;
        this.shouldDisplayError = false;
        this.isRoomAvailable = false;
        this.isRandomButtonAvailable = false;
        this.errorMessage = '';
        // this.clientSocketService.socket.connect();
        // Method for button and others
    }

    ngOnInit(): void {
        this.configureRooms();
        this.handleRoomUnavailability();
        this.receiveRoomAvailable();
        this.receiveRandomPlacement();
        this.receiveJoinDecision();
        this.handleObservableRoomsAvailability();
        this.sendObserverToGame();
        this.clientSocketService.initialize();
        this.confirm();
        this.clientSocketService.socket.emit('getRoomsConfiguration');
        this.clientSocketService.socket.emit('getRoomAvailable');

        this._MatPaginatorIntl.itemsPerPageLabel = 'Salons par page';
        this._MatPaginatorIntl.firstPageLabel = 'Première page';
        this._MatPaginatorIntl.lastPageLabel = 'Dernière page';
        this._MatPaginatorIntl.nextPageLabel = 'Page suivante';
        this._MatPaginatorIntl.previousPageLabel = 'Page précédente';

        // This function is not crucial for our application, it's important to have some texts in french
        // as we are missing, we did not cover these lines in the tests.
        const frenchRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) return `0 de ${length}`;
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
            return `${startIndex + 1} - ${endIndex} de ${length}`;
        };

        this._MatPaginatorIntl.getRangeLabel = frenchRangeLabel;
    }

    onPageChange(event: PageEvent): void {
        // Set the offset for the view
        this.roomItemIndex = event.pageSize * event.pageIndex;
    }

    computeRoomState(state: State): string {
        return state === State.Waiting ? 'En attente' : 'Indisponible';
    }

    computeRoomType(room: Room): string {
        if (room.gameSettings.password !== '') {
            return 'Publique avec mot de passe';
        }
        return room.gameSettings.type === RoomType.public ? 'Publique' : 'Privée';
    }

    join(room: Room, isObserver: boolean): void {
        // if names are equals
        if (room.gameSettings.creatorName === this.authService.currentUser.pseudonym) {
            this.displayErrorMessage(ErrorMessage.NameAlreadyUsed);
            return;
        }

        if (room.gameSettings.type === RoomType.private) {
            this.clientSocketService.socket.emit('sendRequestToCreator', this.authService.currentUser, room.id);
            return;
        }

        if (room.gameSettings.password === '') {
            if (isObserver) {
                this.clientSocketService.socket.emit('newRoomObserver', this.authService.currentUser, room.id);
                return;
            }
            this.clientSocketService.socket.emit('newRoomCustomer', this.authService.currentUser.pseudonym, room.id);
            return;
        }

        this.dialog
            .open(NameSelectorComponent, { disableClose: true })
            .afterClosed()
            .subscribe((password: string) => {
                // if user closes the dialog box without input nothing
                if (password === null) return;

                if (password === room.gameSettings.password) {
                    if (isObserver) {
                        this.clientSocketService.socket.emit('newRoomObserver', this.authService.currentUser, room.id);

                        return;
                    }
                    this.clientSocketService.socket.emit('newRoomCustomer', this.authService.currentUser.pseudonym, room.id);
                    return;
                }
                this.displayErrorMessage(ErrorMessage.BadGamePassword);
                return;
            });
    }

    confirm() {
        this.clientSocketService.socket.on('goToWaiting', () => {
            this.router.navigate(['waiting-room']);
        });
    }

    receiveRandomPlacement(): void {
        this.clientSocketService.socket.on('receiveCustomerOfRandomPlacement', (customerName: string, roomId: string) => {
            this.clientSocketService.socket.emit('newRoomCustomer', customerName, roomId);
        });
    }

    receiveRoomAvailable(): void {
        this.clientSocketService.socket.on('roomAvailable', (numberOfRooms: number) => {
            if (numberOfRooms === 0) {
                this.isRoomAvailable = false;
                return;
            } else if (numberOfRooms === 1) {
                this.isRoomAvailable = true;
                this.isRandomButtonAvailable = false;
            } else {
                this.isRoomAvailable = true;
                this.isRandomButtonAvailable = true;
            }
        });
    }

    private handleRoomUnavailability(): void {
        this.clientSocketService.socket.on('roomAlreadyToken', () => {
            this.displayErrorMessage(ErrorMessage.RoomUnavailable);
        });
    }
    private handleObservableRoomsAvailability(): void {
        this.clientSocketService.socket.on('roomFullObservers', () => {
            this.displayErrorMessage(ErrorMessage.NoMoreObservers);
        });
    }
    private receiveJoinDecision(): void {
        this.clientSocketService.socket.on('receiveJoinDecision', (decision: boolean, roomId: string) => {
            if (decision) {
                this.clientSocketService.socket.emit('newRoomCustomer', this.authService.currentUser.pseudonym, roomId);
                return;
            }
            this.displayErrorMessage(ErrorMessage.JoinDisapproval);
        });
    }
    private configureRooms(): void {
        this.clientSocketService.socket.on('roomConfiguration', (rooms) => {
            this.rooms = [];
            for (const room of rooms) {
                this.rooms.push(
                    new Room(room.id, room.gameSettings, room.state, room.socketIds, room.aiPlayersNumber, room.humanPlayersNumber, room.observers),
                );
            }
        });
    }

    private sendObserverToGame(): void {
        this.clientSocketService.socket.on('ObserverToGameView', () => {
            this.authService.currentUser.isObserver = true;
            this.router.navigate(['game']);
        });
    }

    private displayErrorMessage(message: string): void {
        this.errorMessage = message;
        this.shouldDisplayError = true;
        setTimeout(() => {
            this.shouldDisplayError = false;
            this.errorMessage = '';
        }, ERROR_MESSAGE_DELAY);
    }
}
