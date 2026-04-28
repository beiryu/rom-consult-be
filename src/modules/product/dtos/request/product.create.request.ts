import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import {
    IsString,
    IsUUID,
    IsOptional,
    IsBoolean,
    IsInt,
    Min,
    MaxLength,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductImageDto {
    @ApiProperty({
        example: 'products/images/product-123.jpg',
        description: 'S3 key for the image',
    })
    @IsString()
    key: string;

    @ApiPropertyOptional({
        example: false,
        default: false,
        description: 'Whether this is the primary image',
    })
    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @ApiPropertyOptional({
        example: 0,
        default: 0,
        description: 'Sort order for image display',
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class ProductVariantInputDto {
    @ApiProperty({ example: '$50 Points | Fully Unlocked' })
    @IsString()
    label: string;

    @ApiProperty({ example: '99.99' })
    @IsString()
    price: string;

    @ApiPropertyOptional({ example: 'USD', default: 'USD' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 0, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class ProductCreateDto {
    @ApiProperty({
        example: faker.commerce.productName(),
        description:
            'Product name (can be duplicated; not required to be unique)',
    })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiPropertyOptional({
        example: faker.helpers.slugify(faker.commerce.productName()),
        description: 'URL-friendly slug (auto-generated if not provided)',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    slug?: string;

    @ApiProperty({
        example: faker.commerce.productDescription(),
        description: 'Product description',
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: '99.99',
        description: 'Product price in base currency',
    })
    @IsString()
    price: string;

    @ApiPropertyOptional({
        example: 'USD',
        default: 'USD',
        description: 'Base currency',
    })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    currency?: string;

    @ApiPropertyOptional({
        example: true,
        default: true,
        description: 'Whether the product is active',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        example: false,
        default: false,
        description: 'Whether the product is featured',
    })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiPropertyOptional({
        example: 0,
        default: 0,
        description: 'Display sort order (carousels)',
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiProperty({
        example: faker.string.uuid(),
        description: 'Category ID',
    })
    @IsUUID()
    categoryId: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    features?: unknown;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    included?: unknown;

    @ApiPropertyOptional({ type: [Object] })
    @IsOptional()
    sessionMeta?: unknown;

    @ApiPropertyOptional({ type: [Object] })
    @IsOptional()
    howItWorks?: unknown;

    @ApiPropertyOptional({
        type: [ProductImageDto],
        description: 'Product images',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductImageDto)
    images?: ProductImageDto[];

    @ApiPropertyOptional({
        type: [ProductVariantInputDto],
        description: 'Purchasable variants',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantInputDto)
    variants?: ProductVariantInputDto[];

}
