import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAccountDto {
    
    @ApiProperty()
    @IsString()
    avatar: string;

    @ApiProperty()
    @IsString()
    pseudonym: string;
    
    @ApiProperty()
    @IsString()
    password: string;
    
    @ApiProperty()
    @IsString()
    email: string;
}

