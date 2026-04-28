import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { UserResponseDto } from 'src/modules/user/dtos/response/user.response';

export class TokenDto {
    @ApiProperty({
        example: faker.string.alphanumeric({ length: 64 }),
        required: true,
    })
    @Expose()
    accessToken: string;

    @ApiProperty({
        example: faker.string.alphanumeric({ length: 64 }),
        required: true,
    })
    @Expose()
    refreshToken: string;
}

export class AuthResponseDto extends TokenDto {
    @ApiProperty({
        type: () => UserResponseDto,
        required: true,
    })
    @Expose()
    @Type(() => UserResponseDto)
    @ValidateNested()
    user: UserResponseDto;
}

export class AuthRefreshResponseDto extends TokenDto {}

export class AuthSuccessResponseDto {
    @ApiProperty({ example: true })
    @Expose()
    success: boolean;

    @ApiProperty({ example: 'auth.success.generic' })
    @Expose()
    message: string;
}
