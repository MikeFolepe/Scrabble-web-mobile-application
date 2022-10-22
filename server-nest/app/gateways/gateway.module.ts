import { UsersModule } from '@app/users/users.module';
import { Logger, Module } from '@nestjs/common';
import { ChatGateway } from './chatbox/chat.gateway';
import { GameHandlerGateway } from './game-handler/game-handler.gateway';
import { RoomManagerService } from './services/room-manager/room-manager.service';

@Module({
    imports: [UsersModule],
    controllers: [],
    providers: [ChatGateway, Logger, RoomManagerService, GameHandlerGateway],
})
export class GatewayModule {}
