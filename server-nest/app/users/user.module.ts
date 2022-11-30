import { CONNECTION_SCHEMA } from '@app/model/connection-schema';
import { FRIEND_SCHEMA } from '@app/model/friend.schema';
import { GAME_SCHEMA } from '@app/model/game-schema';
import { NOTIFICATION_SCHEMA } from '@app/model/notification-schema';
import { USER_STATS_SCHEMA } from '@app/model/user-stats.schema';
import { USER_SCHEMA } from '@app/model/user.schema';
import { PreferenceModule } from '@app/Preference/preference.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: USER_SCHEMA },
            { name: 'Friend', schema: FRIEND_SCHEMA },
            { name: 'UserStats', schema: USER_STATS_SCHEMA },
            { name: 'Connection', schema: CONNECTION_SCHEMA },
            { name: 'Game', schema: GAME_SCHEMA },
            { name: 'Notification', schema: NOTIFICATION_SCHEMA},
        ]),
        PreferenceModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {}
