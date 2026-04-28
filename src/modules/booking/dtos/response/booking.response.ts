import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { Booking, BookingStatus } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class BookingResponseDto implements Booking {
    @ApiProperty({ example: faker.string.uuid() })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty({ example: 'BC-20260429-ABC12' })
    @Expose()
    @IsString()
    bookingRef: string;

    @ApiProperty({ example: faker.string.uuid() })
    @Expose()
    @IsUUID()
    userId: string;

    @ApiProperty({ example: faker.string.uuid() })
    @Expose()
    @IsUUID()
    productId: string;

    @ApiPropertyOptional({ example: 'zoom', nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    platform: string | null;

    @ApiProperty({ example: faker.date.future().toISOString() })
    @Expose()
    @IsDate()
    scheduledAt: Date;

    @ApiProperty({ enum: BookingStatus, example: BookingStatus.SCHEDULED })
    @Expose()
    @IsEnum(BookingStatus)
    status: BookingStatus;

    @ApiPropertyOptional({ example: faker.string.uuid(), nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    orderId: string | null;

    @ApiProperty({ example: faker.date.past().toISOString() })
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty({ example: faker.date.recent().toISOString() })
    @Expose()
    @IsDate()
    updatedAt: Date;
}
