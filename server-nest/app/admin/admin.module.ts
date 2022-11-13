// import { UsersModule } from '@app/gateways/services/user/users.module';
import { AI_SCHEMA } from '@app/model/ai.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'AiBeginnerName', schema: AI_SCHEMA },
            { name: 'AiExpertName', schema: AI_SCHEMA },
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
