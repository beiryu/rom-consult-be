import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import {
    IsArray,
    IsInt,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CartSyncItemDto {
    @ApiProperty({
        example: faker.string.uuid(),
        description: 'Product ID to sync to cart',
    })
    @IsUUID()
    productId: string;

    @ApiProperty({
        example: 1,
        default: 1,
        description: 'Quantity to set for item',
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    quantity: number;

}

export class CartSyncDto {
    @ApiProperty({
        type: CartSyncItemDto,
        isArray: true,
        description: 'Complete cart items to replace existing cart state',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartSyncItemDto)
    items: CartSyncItemDto[];
}
