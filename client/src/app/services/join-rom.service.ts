import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ErrorMessage } from '@app/classes/error-message-constants';
import { AddChatRoomComponent } from '@app/modules/game-view/add-chat-room/add-chat-room.component';
import { ChangeChatRoomComponent } from '@app/modules/game-view/change-chat-room/change-chat-room.component';
import { JoinChatRoomsComponent } from '@app/modules/game-view/join-chat-rooms/join-chat-rooms.component';
import { NameSelectorComponent } from '@app/modules/initialize-game/name-selector/name-selector.component';
import { ERROR_MESSAGE_DELAY, MAX_LENGTH_OBSERVERS } from '@common/constants';
import { RoomType } from '@common/game-settings';
import { Room, State } from '@common/room';
import { AuthService } from './auth.service';
import { ChannelHandlerService } from './channel-handler.service';
import { ClientSocketService } from './client-socket.service';
import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root',
})
export class JoinRomService {
    rooms: Room[];
    roomItemIndex: number;
    pageSize: number;
    shouldDisplayError: boolean;
    isRoomAvailable: boolean;
    isRandomButtonAvailable: boolean;
    errorMessage: string;
    maxObserversLength = MAX_LENGTH_OBSERVERS;
    constructor(
        private clientSocketService: ClientSocketService,
        private authService: AuthService,
        public channelHandlerService: ChannelHandlerService,
        public dialog: MatDialog,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public joinChatRoomsDialog: MatDialog,
        public changeChatRoomDialog: MatDialog,
        public addChatRoomDialog: MatDialog,
        private router: Router,
        public playerService: PlayerService,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public _MatPaginatorIntl: MatPaginatorIntl,
    ) {
        this.configureRooms();
        this.handleRoomUnavailability();
        this.receiveRandomPlacement();
        this.receiveJoinDecision();
        this.handleObservableRoomsAvailability();
        this.sendObserverToGame();
        this.confirm();
        this.initPagination();
        this.rooms = [];
        this.roomItemIndex = 0;
        // 2 rooms per page
        this.pageSize = 2;
        this.shouldDisplayError = false;
        this.isRoomAvailable = false;
        this.isRandomButtonAvailable = false;
        this.errorMessage = '';
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
    initPagination(): void {
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

    join(room: Room, isObserver: boolean): void {
        // if names are equals
        if (room.gameSettings.creatorName === this.authService.currentUser.pseudonym) {
            this.displayErrorMessage(ErrorMessage.NameAlreadyUsed);
            return;
        }

        if (room.gameSettings.type === RoomType.private) {
            this.clientSocketService.socket.emit('sendRequestToCreator', this.authService.currentUser.pseudonym, room.id);
            console.log('emittedRequest');
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
                    } else {
                        this.clientSocketService.socket.emit('newRoomCustomer', this.authService.currentUser.pseudonym, room.id);
                    }
                } else {
                    this.displayErrorMessage(ErrorMessage.BadGamePassword);
                    return;
                }
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

    openChangeChatRoomDialog(): void {
        this.changeChatRoomDialog.open(ChangeChatRoomComponent, { disableClose: true });
    }

    openJoinChatRoomDialog(): void {
        this.joinChatRoomsDialog.open(JoinChatRoomsComponent, { disableClose: true });
    }

    openAddChatRoomDialog(): void {
        this.addChatRoomDialog.open(AddChatRoomComponent, { disableClose: true });
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
        this.clientSocketService.socket.on('roomConfiguration', (rooms: Room[]) => {
            this.rooms = rooms;
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
