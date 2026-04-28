import { ApiPropertyOptional } from '@nestjs/swagger';
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
import {
    ProductVariantInputDto,
} from './product.create.request';

export class ProductVariantUpdateInputDto extends ProductVariantInputDto {
    @ApiPropertyOptional({
        description: 'Existing variant ID (omit to create)',
    })
    @IsOptional()
    @IsUUID()
    id?: string;
}

export class ProductUpdateDto {
    @ApiPropertyOptional({
        example: faker.commerce.productName(),
        description:
            'Product name (can be duplicated and changed; not required to be unique)',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: faker.helpers.slugify(faker.commerce.productName()),
        description: 'URL-friendly slug',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    slug?: string;

    @ApiPropertyOptional({
        example: faker.commerce.productDescription(),
        description: 'Product description',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        example: '99.99',
        description: 'Product price in base currency',
    })
    @IsOptional()
    @IsString()
    price?: string;

    @ApiPropertyOptional({
        example: 'USD',
        description: 'Base currency',
    })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    currency?: string;

    @ApiPropertyOptional({
        example: true,
        description: 'Whether the product is active',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        example: false,
        description: 'Whether the product is featured',
    })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiPropertyOptional({
        example: 0,
        description: 'Display sort order',
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({
        example: faker.string.uuid(),
        description: 'Category ID',
    })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

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
        type: [ProductVariantUpdateInputDto],
        description: 'Replace/sync variants when provided',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantUpdateInputDto)
    variants?: ProductVariantUpdateInputDto[];

}
