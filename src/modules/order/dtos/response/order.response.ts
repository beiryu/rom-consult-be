import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { OrderItem, OrderStatus, Prisma } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import {
    IsString,
    IsDate,
    IsUUID,
    IsEnum,
    IsInt,
    IsOptional,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { ProductResponseDto } from 'src/modules/product/dtos/response/product.response';

export class OrderItemResponseDto implements OrderItem {
    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    orderId: string;

    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    productId: string;

    @ApiProperty({
        example: 2,
    })
    @Expose()
    @IsInt()
    quantity: number;

    @ApiProperty({
        example: '99.99',
    })
    @Expose()
    @Type(() => String)
    priceAtPurchase: Prisma.Decimal; // Prisma Decimal type

    @ApiPropertyOptional({
        example: null,
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsUUID()
    variantId: string | null;

    @ApiPropertyOptional({
        example: '$50 Points | Fully Unlocked',
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsString()
    variantLabel: string | null;


    @ApiProperty({
        example: faker.date.past().toISOString(),
    })
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty({
        example: faker.date.recent().toISOString(),
    })
    @Expose()
    @IsDate()
    updatedAt: Date;

    @ApiPropertyOptional({
        type: ProductResponseDto,
    })
    @Expose()
    @IsOptional()
    @Type(() => ProductResponseDto)
    @ValidateNested()
    product?: ProductResponseDto;
}

export class OrderResponseDto {
    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty({
        example: 'ORD-20260130-ABC12',
    })
    @Expose()
    @IsString()
    orderNumber: string;

    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    userId: string;

    @ApiProperty({
        enum: OrderStatus,
        example: OrderStatus.PENDING,
    })
    @Expose()
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiProperty({
        example: '199.98',
    })
    @Expose()
    @Type(() => String)
    totalAmount: Prisma.Decimal; // Prisma Decimal type

    @ApiProperty({
        example: 'USD',
    })
    @Expose()
    @IsString()
    currency: string;

    @ApiProperty({
        example: faker.date.past().toISOString(),
    })
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty({
        example: faker.date.recent().toISOString(),
    })
    @Expose()
    @IsDate()
    updatedAt: Date;

    @ApiPropertyOptional({
        example: faker.date.recent().toISOString(),
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsDate()
    completedAt: Date | null;

    @ApiPropertyOptional({
        example: null,
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsDate()
    cancelledAt: Date | null;

    @ApiPropertyOptional({
        example: faker.date.past().toISOString(),
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsDate()
    deletedAt: Date | null;

    @ApiPropertyOptional({
        type: [OrderItemResponseDto],
    })
    @Expose()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemResponseDto)
    items?: OrderItemResponseDto[];
}

export class OrderUserSnapshotDto {
    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty({
        example: faker.internet.email(),
    })
    @Expose()
    @IsString()
    email: string;

    @ApiProperty({
        example: faker.internet.username(),
    })
    @Expose()
    @IsString()
    userName: string;

    @ApiPropertyOptional({
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsString()
    firstName: string | null;

    @ApiPropertyOptional({
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsString()
    lastName: string | null;
}

export class OrderDetailResponseDto extends OrderResponseDto {
    @ApiProperty({
        type: [OrderItemResponseDto],
    })
    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemResponseDto)
    items: OrderItemResponseDto[];

    @ApiPropertyOptional({
        type: OrderUserSnapshotDto,
    })
    @Expose()
    @IsOptional()
    @ValidateNested()
    @Type(() => OrderUserSnapshotDto)
    user?: OrderUserSnapshotDto;
}
