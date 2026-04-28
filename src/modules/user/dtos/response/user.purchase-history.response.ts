import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import {
    IsArray,
    IsDate,
    IsEnum,
    IsNumber,
    IsString,
    IsOptional,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class PurchaseHistoryCategoryDto {
    @ApiProperty()
    @Expose()
    @IsString()
    id: string;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty()
    @Expose()
    @IsString()
    slug: string;
}

export class PurchaseHistoryProductDto {
    @ApiProperty()
    @Expose()
    @IsString()
    id: string;

    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty()
    @Expose()
    @IsString()
    slug: string;

    @ApiProperty()
    @Expose()
    @Type(() => PurchaseHistoryCategoryDto)
    category: PurchaseHistoryCategoryDto;

}

export class PurchaseHistoryOrderItemDto {
    @ApiProperty()
    @Expose()
    @IsString()
    id: string;

    @ApiProperty()
    @Expose()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    priceAtPurchase: number;

    @ApiProperty()
    @Expose()
    @IsString()
    @IsOptional()
    deliveredContent?: string | null;

    @ApiProperty()
    @Expose()
    @IsDate()
    @IsOptional()
    deliveredAt?: Date | null;

    @ApiProperty()
    @Expose()
    @Type(() => PurchaseHistoryProductDto)
    product: PurchaseHistoryProductDto;
}

export class PurchaseHistoryOrderDto {
    @ApiProperty()
    @Expose()
    @IsString()
    id: string;

    @ApiProperty()
    @Expose()
    @IsString()
    orderNumber: string;

    @ApiProperty({ enum: OrderStatus })
    @Expose()
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiProperty()
    @Expose()
    @IsNumber()
    totalAmount: number;

    @ApiProperty()
    @Expose()
    @IsString()
    currency: string;

    @ApiProperty({ type: [PurchaseHistoryOrderItemDto] })
    @Expose()
    @Type(() => PurchaseHistoryOrderItemDto)
    @IsArray()
    items: PurchaseHistoryOrderItemDto[];

    @ApiProperty()
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty()
    @Expose()
    @IsDate()
    @IsOptional()
    completedAt?: Date | null;
}

export class PurchaseHistoryResponseDto {
    @ApiProperty({ type: [PurchaseHistoryOrderDto] })
    @Expose()
    @Type(() => PurchaseHistoryOrderDto)
    @IsArray()
    orders: PurchaseHistoryOrderDto[];
}
