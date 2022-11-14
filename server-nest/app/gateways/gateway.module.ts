import { UsersModule } from '@app/users/users.module';
import { Logger, Module } from '@nestjs/common';
import { ChatGateway } from './chat-channel/chat.gateway';
import { GameHandlerGateway } from './game-handler/game-handler.gateway';
import { ChatRoomService } from './services/chat-room/chat-room.service';
import { RoomManagerService } from './services/room-manager/room-manager.service';

@Module({
    imports: [UsersModule],
    controllers: [],
    providers: [ChatGateway, Logger, RoomManagerService, GameHandlerGateway, ChatRoomService],
})
export class GatewayModule {}
