import { UsersModule } from '@app/users/users.module';
import { Logger, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [UsersModule],
    controllers: [],
    providers: [ChatGateway, Logger],
})
export class ChatGatewayModule {}
