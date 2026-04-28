import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultantTier } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ConsultantApplicationCreateDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @ApiProperty()
    @IsString()
    expertise: string;

    @ApiProperty()
    @IsString()
    experience: string;

    @ApiProperty()
    @IsString()
    bio: string;

    @ApiProperty({ enum: ConsultantTier })
    @IsEnum(ConsultantTier)
    tier: ConsultantTier;

    @ApiProperty()
    @IsString()
    daysAvailable: string;

    @ApiProperty()
    @IsString()
    timezone: string;

    @ApiProperty()
    @IsString()
    timeSlots: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    linkedin?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty()
    @IsString()
    motivation: string;

    @ApiProperty()
    @IsBoolean()
    agreedToTerms: boolean;
}
