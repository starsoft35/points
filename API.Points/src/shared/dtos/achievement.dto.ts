import { IsString, IsInt, IsBase64, MaxLength, IsNotEmpty } from 'class-validator';

import { BaseDto } from './base.dto';

export class AchievementDto extends BaseDto {
    readonly id: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200, { message: '200 character max' })
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200, { message: '200 character max' })
    readonly description: string;

    @IsInt()
    @IsNotEmpty()
    readonly points: number;

    @IsBase64() readonly photo: any;
}

