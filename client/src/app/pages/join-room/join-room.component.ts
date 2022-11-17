// JUSTIFICATION: The '_' are native to _MatPaginatorIntl attributes
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket.service';

import { JoinRomService } from '@app/services/join-rom.service';

@Component({
    selector: 'app-join-room',
    templateUrl: './join-room.component.html',
    styleUrls: ['./join-room.component.scss'],
})
export class JoinRoomComponent implements OnInit {
    // JUSTIFICATION : must name service as it is named in MatPaginatorIntl
    // eslint-disable-next-line @typescript-eslint/naming-convention
    constructor(public joinRoomService: JoinRomService, private clientSocketService: ClientSocketService) {}

    ngOnInit(): void {
        this.clientSocketService.socket.emit('getRoomsConfiguration');
        this.clientSocketService.socket.emit('getRoomAvailable');
    }
}
