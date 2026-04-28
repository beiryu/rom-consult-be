import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { OrderStatus } from '@prisma/client';

import { DatabaseService } from 'src/common/database/services/database.service';

import { OrderDeliverDto } from '../dtos/request/order.deliver.request';
import { OrderResponseDto } from '../dtos/response/order.response';
import { OrderDeliveryResponseDto } from '../dtos/response/order-delivery.response';
import { IOrderDeliveryService } from '../interfaces/order-delivery.service.interface';

@Injectable()
export class OrderDeliveryService implements IOrderDeliveryService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(OrderDeliveryService.name);
    }

    /**
     * Process instant delivery for order items
     */
    async processInstantDelivery(orderId: string): Promise<OrderResponseDto> {
        try {
            const order = await this.databaseService.order.findUnique({
                where: { id: orderId },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new HttpException(
                    'order.error.orderNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            // Only process if order is COMPLETED
            if (order.status !== OrderStatus.COMPLETED) {
                throw new HttpException(
                    'order.error.invalidOrderStatusForDelivery',
                    HttpStatus.BAD_REQUEST
                );
            }

            const deliveryItems = [];

            // All items should be delivered when order is COMPLETED
            // Status remains COMPLETED

            this.logger.info(
                {
                    orderId,
                    deliveredItems: deliveryItems.length,
                },
                'Instant delivery processed'
            );

            // Fetch updated order
            return this.databaseService.order.findUnique({
                where: { id: orderId },
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
            }) as unknown as Promise<OrderResponseDto>;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(
                `Failed to process instant delivery: ${error.message}`
            );
            throw new HttpException(
                'order.error.processInstantDeliveryFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Deliver order manually (admin)
     */
    async deliverOrder(
        orderId: string,
        data: OrderDeliverDto
    ): Promise<OrderResponseDto> {
        try {
            const order = await this.databaseService.order.findUnique({
                where: { id: orderId },
                include: {
                    items: true,
                },
            });

            if (!order) {
                throw new HttpException(
                    'order.error.orderNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            // Only allow delivery if order is COMPLETED
            if (order.status !== OrderStatus.COMPLETED) {
                throw new HttpException(
                    'order.error.invalidOrderStatusForDelivery',
                    HttpStatus.BAD_REQUEST
                );
            }

            const finalOrder = await this.databaseService.order.update({
                where: { id: orderId },
                data: {},
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
            });

            this.logger.info(
                {
                    orderId,
                    deliveredItems: data.items.length,
                    allDelivered: true,
                },
                'Order delivered manually'
            );

            // TODO: Send delivery notification email/push notification
            // this.notificationService.sendDeliveryNotification(order.userId, orderId);

            return finalOrder as unknown as OrderResponseDto;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to deliver order: ${error.message}`);
            throw new HttpException(
                'order.error.deliverOrderFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get delivery content for order (user-facing)
     */
    async getDeliveryContent(
        orderId: string,
        userId: string
    ): Promise<OrderDeliveryResponseDto> {
        try {
            const order = await this.databaseService.order.findFirst({
                where: {
                    id: orderId,
                    userId,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new HttpException(
                    'order.error.orderNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            // Only return content if order is COMPLETED
            if (order.status !== OrderStatus.COMPLETED) {
                throw new HttpException(
                    'order.error.orderNotDelivered',
                    HttpStatus.BAD_REQUEST
                );
            }

            const deliveryItems = [];

            return {
                orderId: order.id,
                orderNumber: order.orderNumber,
                items: deliveryItems,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(
                `Failed to get delivery content: ${error.message}`
            );
            throw new HttpException(
                'order.error.getDeliveryContentFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
