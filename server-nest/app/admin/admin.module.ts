import { AccountService } from '@app/gateways/services/account/account.service';
import { AccountSchema } from '@app/model/account.schema';
import { AI_SCHEMA } from '@app/model/ai.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name : 'Account', schema : AccountSchema },
            { name: 'AiBeginnerName', schema: AI_SCHEMA },
            { name: 'AiExpertName', schema: AI_SCHEMA },
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService, AccountService],
})
export class AdminModule {}
