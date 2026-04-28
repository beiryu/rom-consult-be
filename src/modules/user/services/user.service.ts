import {
    HttpStatus,
    Injectable,
    HttpException,
} from '@nestjs/common';

import { DatabaseService } from 'src/common/database/services/database.service';
import { HelperEncryptionService } from 'src/common/helper/services/helper.encryption.service';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { UserUpdateDto } from '../dtos/request/user.update.request';
import { UserBanDto } from '../dtos/request/user.ban.request';
import {
    UserGetProfileResponseDto,
    UserUpdateProfileResponseDto,
} from '../dtos/response/user.response';
import { PurchaseHistoryOrderDto } from '../dtos/response/user.purchase-history.response';
import { IUserService } from '../interfaces/user.service.interface';

@Injectable()
export class UserService implements IUserService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly helperEncryptionService: HelperEncryptionService
    ) {}

    async updateUser(
        userId: string,
        data: UserUpdateDto
    ): Promise<UserUpdateProfileResponseDto> {
        try {
            const user = await this.databaseService.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new HttpException(
                    'user.error.userNotFound',
                    HttpStatus.NOT_FOUND
                );
            }
            const updatedUser = await this.databaseService.user.update({
                where: { id: userId },
                data,
            });
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(
        userId: string,
        currentUserId: string,
        password?: string
    ): Promise<ApiGenericResponseDto> {
        try {
            const user = await this.databaseService.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new HttpException(
                    'user.error.userNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            if (currentUserId !== userId) {
                throw new HttpException(
                    'auth.error.insufficientPermissions',
                    HttpStatus.FORBIDDEN
                );
            }

            if (!password) {
                throw new HttpException(
                    'auth.error.invalidPassword',
                    HttpStatus.BAD_REQUEST
                );
            }

            const passwordMatched = await this.helperEncryptionService.match(
                user.password,
                password
            );

            if (!passwordMatched) {
                throw new HttpException(
                    'auth.error.invalidPassword',
                    HttpStatus.BAD_REQUEST
                );
            }

            await this.databaseService.user.update({
                where: { id: userId },
                data: { deletedAt: new Date() },
            });

            return {
                success: true,
                message: 'user.success.userDeleted',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'user.error.failedToDeleteUser',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getProfile(id: string): Promise<UserGetProfileResponseDto> {
        const user = await this.databaseService.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new HttpException(
                'user.error.userNotFound',
                HttpStatus.NOT_FOUND
            );
        }
        return user;
    }

    async banUser(
        userId: string,
        data: UserBanDto
    ): Promise<ApiGenericResponseDto> {
        try {
            const user = await this.databaseService.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new HttpException(
                    'user.error.userNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            throw new HttpException(
                'user.error.banNotSupported',
                HttpStatus.BAD_REQUEST
            );
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'user.error.failedToBanUser',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async unbanUser(userId: string): Promise<ApiGenericResponseDto> {
        try {
            const user = await this.databaseService.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new HttpException(
                    'user.error.userNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            throw new HttpException(
                'user.error.unbanNotSupported',
                HttpStatus.BAD_REQUEST
            );
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'user.error.failedToUnbanUser',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getPurchaseHistory(
        userId: string
    ): Promise<PurchaseHistoryOrderDto[]> {
        try {
            const orders = await this.databaseService.order.findMany({
                where: {
                    userId,
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    category: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return orders as unknown as PurchaseHistoryOrderDto[];
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'user.error.failedToGetPurchaseHistory',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
