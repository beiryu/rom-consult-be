import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { Prisma, Product, ProductImage } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import {
    IsString,
    IsBoolean,
    IsInt,
    IsDate,
    IsOptional,
    IsUUID,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { CategoryResponseDto } from './category.response';

export class ProductImageResponseDto implements ProductImage {
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
    productId: string;

    @ApiProperty({
        example: 'products/images/product-123.jpg',
    })
    @Expose()
    @IsString()
    key: string;

    @ApiPropertyOptional({
        example:
            'https://s3.amazonaws.com/bucket/products/images/product-123.jpg',
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsString()
    url: string | null;

    @ApiProperty({
        example: false,
    })
    @Expose()
    @IsBoolean()
    isPrimary: boolean;

    @ApiProperty({
        example: 0,
    })
    @Expose()
    @IsInt()
    sortOrder: number;

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
        example: null,
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsDate()
    deletedAt: Date | null;
}

export class ProductVariantResponseDto {
    @ApiProperty({ example: faker.string.uuid() })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty({ example: faker.string.uuid() })
    @Expose()
    @IsUUID()
    productId: string;

    @ApiProperty({ example: '$50 Points | Fully Unlocked' })
    @Expose()
    @IsString()
    label: string;

    @ApiProperty({ example: '99.99' })
    @Expose()
    @Type(() => String)
    price: Prisma.Decimal;

    @ApiProperty({ example: 'USD' })
    @Expose()
    @IsString()
    currency: string;

    @ApiProperty({ example: true })
    @Expose()
    @IsBoolean()
    isActive: boolean;

    @ApiProperty({ example: 0 })
    @Expose()
    @IsInt()
    sortOrder: number;

    @ApiPropertyOptional({ example: null, nullable: true })
    @Expose()
    @IsOptional()
    @IsDate()
    deletedAt: Date | null;
}

export class ProductResponseDto implements Product {
    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty({
        example: faker.commerce.productName(),
    })
    @Expose()
    @IsString()
    name: string;

    @ApiProperty({
        example: faker.helpers.slugify(faker.commerce.productName()),
    })
    @Expose()
    @IsString()
    slug: string;

    @ApiProperty({
        example: faker.commerce.productDescription(),
    })
    @Expose()
    @IsString()
    description: string;

    @ApiProperty({
        example: '99.99',
    })
    @Expose()
    @Type(() => String)
    price: Prisma.Decimal;

    @ApiProperty({
        example: 'USD',
    })
    @Expose()
    @IsString()
    currency: string;

    @ApiProperty({
        example: true,
    })
    @Expose()
    @IsBoolean()
    isActive: boolean;

    @ApiProperty({
        example: false,
    })
    @Expose()
    @IsBoolean()
    isFeatured: boolean;

    @ApiProperty({ example: 0 })
    @Expose()
    @IsInt()
    sortOrder: number;

    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    categoryId: string;

    @ApiPropertyOptional({ type: [String], nullable: true })
    @Expose()
    @IsOptional()
    features: Prisma.JsonValue | null;

    @ApiPropertyOptional({ type: [String], nullable: true })
    @Expose()
    @IsOptional()
    included: Prisma.JsonValue | null;

    @ApiPropertyOptional({ type: [Object], nullable: true })
    @Expose()
    @IsOptional()
    sessionMeta: Prisma.JsonValue | null;

    @ApiPropertyOptional({ type: [Object], nullable: true })
    @Expose()
    @IsOptional()
    howItWorks: Prisma.JsonValue | null;

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
        example: null,
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsDate()
    deletedAt: Date | null;

    @ApiPropertyOptional({
        type: CategoryResponseDto,
    })
    @Expose()
    @IsOptional()
    @Type(() => CategoryResponseDto)
    @ValidateNested()
    category?: CategoryResponseDto;

    @ApiPropertyOptional({
        type: [ProductImageResponseDto],
    })
    @Expose()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductImageResponseDto)
    images?: ProductImageResponseDto[];

    @ApiPropertyOptional({
        type: [ProductVariantResponseDto],
    })
    @Expose()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantResponseDto)
    variants?: ProductVariantResponseDto[];

}

export class ProductListResponseDto extends ProductResponseDto {
    @ApiPropertyOptional({
        type: CategoryResponseDto,
    })
    @Expose()
    @IsOptional()
    @Type(() => CategoryResponseDto)
    @ValidateNested()
    category?: CategoryResponseDto;

    @ApiPropertyOptional({
        type: [ProductImageResponseDto],
    })
    @Expose()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductImageResponseDto)
    images?: ProductImageResponseDto[];

    @ApiPropertyOptional({
        description: 'Primary image URL for cards',
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsString()
    primaryImageUrl: string | null;

    @ApiProperty({
        description: 'Minimum active variant price, or base product price',
        example: '49.99000000',
    })
    @Expose()
    @IsString()
    fromPrice: string;

    @ApiPropertyOptional({
        description: 'Display tags derived from metadata',
        type: [String],
    })
    @Expose()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

export class ProductDetailResponseDto extends ProductListResponseDto {
    @ApiPropertyOptional({
        description: 'Hero image (same as primary for now)',
        nullable: true,
    })
    @Expose()
    @IsOptional()
    @IsString()
    heroImageUrl: string | null;

    @ApiPropertyOptional({
        type: [ProductVariantResponseDto],
    })
    @Expose()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantResponseDto)
    variants?: ProductVariantResponseDto[];

    // Reserved for future linked services.
}
