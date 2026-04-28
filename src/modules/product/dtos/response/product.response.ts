import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { Prisma, Product } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import {
    IsString,
    IsBoolean,
    IsDate,
    IsOptional,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { CategoryResponseDto } from './category.response';

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
        type: CategoryResponseDto,
    })
    @Expose()
    @IsOptional()
    @Type(() => CategoryResponseDto)
    @ValidateNested()
    category?: CategoryResponseDto;

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

}

export class ProductDetailResponseDto extends ProductListResponseDto {
    // Reserved for future linked services.
}
