import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import {
    IsString,
    IsUUID,
    IsOptional,
    IsBoolean,
    MaxLength,
} from 'class-validator';

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

}
