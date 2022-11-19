import { AuthController } from '@app/auth/controller/auth.controller';
import { UsersModule } from '@app/users/user.module';
import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';

@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [UsersModule],
})
export class AuthModule {}
