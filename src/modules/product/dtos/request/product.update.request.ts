import { ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import {
    IsString,
    IsUUID,
    IsOptional,
    IsBoolean,
    MaxLength,
} from 'class-validator';

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

}
