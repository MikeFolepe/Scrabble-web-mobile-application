import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AI_SCHEMA } from '@app/databaseModel/database/ai';
import { DateService } from '@app/services/date/date.service';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ExampleService } from '@app/services/example/example.service';
import { AdminController } from './controllers/admin/adminstrator.controller';
import { AdministratorService } from './services/admin/administrator.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: 'AiBeginnerName', schema: AI_SCHEMA },
            { name: 'AiExpertName', schema: AI_SCHEMA },
        ]),
    ],
    controllers: [AdminController],
    providers: [ChatGateway, AdministratorService, DateService, ExampleService, Logger],
})
export class AppModule {}
