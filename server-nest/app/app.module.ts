import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { GatewayModule } from './gateways/gateway.module';
import { AuthModule } from './auth/auth.module';
import { GameController } from './game/controllers/game/game.controller';
import { WordValidationService } from './game/services/word-validation.service';

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
        AdminModule,
        GatewayModule,
        AuthModule,
    ],
    providers: [Logger, WordValidationService],
    controllers: [GameController],
})
export class AppModule {}
