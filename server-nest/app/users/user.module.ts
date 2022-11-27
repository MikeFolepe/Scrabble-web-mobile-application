import { UserSchema } from '@app/model/user.schema';
import { PreferenceModule } from '@app/Preference/preference.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [PreferenceModule, MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {}
