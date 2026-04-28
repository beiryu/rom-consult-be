import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class BookingCreateDto {
    @ApiProperty({ example: faker.string.uuid() })
    @IsUUID()
    productId: string;

    @ApiPropertyOptional({ example: 'zoom' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    platform?: string;

    @ApiProperty({ example: faker.date.future().toISOString() })
    @IsDateString()
    scheduledAt: string;
}
