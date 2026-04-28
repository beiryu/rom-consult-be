import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import {
    ApplicationStatus,
    ConsultantApplication,
    ConsultantTier,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class ConsultantApplicationResponseDto implements ConsultantApplication {
    @ApiProperty({ example: faker.string.uuid() })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty()
    @Expose()
    @IsString()
    fullName: string;

    @ApiProperty()
    @Expose()
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    phone: string | null;

    @ApiProperty()
    @Expose()
    @IsString()
    expertise: string;

    @ApiProperty()
    @Expose()
    @IsString()
    experience: string;

    @ApiProperty()
    @Expose()
    @IsString()
    bio: string;

    @ApiProperty({ enum: ConsultantTier })
    @Expose()
    @IsEnum(ConsultantTier)
    tier: ConsultantTier;

    @ApiProperty()
    @Expose()
    @IsString()
    daysAvailable: string;

    @ApiProperty()
    @Expose()
    @IsString()
    timezone: string;

    @ApiProperty()
    @Expose()
    @IsString()
    timeSlots: string;

    @ApiPropertyOptional({ nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    linkedin: string | null;

    @ApiPropertyOptional({ nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    website: string | null;

    @ApiProperty()
    @Expose()
    @IsString()
    motivation: string;

    @ApiProperty()
    @Expose()
    @IsBoolean()
    agreedToTerms: boolean;

    @ApiProperty({ enum: ApplicationStatus })
    @Expose()
    @IsEnum(ApplicationStatus)
    status: ApplicationStatus;

    @ApiPropertyOptional({ nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    reviewNotes: string | null;

    @ApiPropertyOptional({ nullable: true })
    @Expose()
    @IsOptional()
    @IsDate()
    reviewedAt: Date | null;

    @ApiProperty({ example: faker.date.past().toISOString() })
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty({ example: faker.date.recent().toISOString() })
    @Expose()
    @IsDate()
    updatedAt: Date;
}
