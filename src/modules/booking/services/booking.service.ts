import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

import { DatabaseService } from 'src/common/database/services/database.service';
import { HelperPaginationService } from 'src/common/helper/services/helper.pagination.service';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';

import { BookingCreateDto } from '../dtos/request/booking.create.request';
import { BookingResponseDto } from '../dtos/response/booking.response';

@Injectable()
export class BookingService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly paginationService: HelperPaginationService,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(BookingService.name);
    }

    private generateBookingRefString(date: Date = new Date()): string {
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `BC-${dateStr}-${randomStr}`;
    }

    private async generateBookingRef(): Promise<string> {
        const bookingRef = this.generateBookingRefString();
        const existing = await this.databaseService.booking.findUnique({
            where: { bookingRef },
        });
        if (existing) {
            return this.generateBookingRef();
        }
        return bookingRef;
    }

    public async createBooking(
        userId: string,
        data: BookingCreateDto
    ): Promise<BookingResponseDto> {
        const product = await this.databaseService.product.findFirst({
            where: { id: data.productId, isActive: true },
        });
        if (!product) {
            throw new HttpException('booking.error.productNotFound', HttpStatus.NOT_FOUND);
        }

        const bookingRef = await this.generateBookingRef();

        const booking = await this.databaseService.booking.create({
            data: {
                bookingRef,
                userId,
                productId: data.productId,
                platform: data.platform,
                scheduledAt: new Date(data.scheduledAt),
            },
        });

        return booking as BookingResponseDto;
    }

    public async getUserBookings(
        userId: string,
        page = 1,
        limit = 10
    ): Promise<ApiPaginatedDataDto<BookingResponseDto>> {
        return this.paginationService.paginate<BookingResponseDto>(
            this.databaseService.booking,
            { page, limit },
            { where: { userId }, orderBy: { createdAt: 'desc' } }
        );
    }

    public async getUserBooking(id: string, userId: string): Promise<BookingResponseDto> {
        const booking = await this.databaseService.booking.findFirst({
            where: { id, userId },
        });
        if (!booking) {
            throw new HttpException('booking.error.notFound', HttpStatus.NOT_FOUND);
        }
        return booking as BookingResponseDto;
    }

    public async getAllBookings(
        page = 1,
        limit = 10,
        status?: BookingStatus
    ): Promise<ApiPaginatedDataDto<BookingResponseDto>> {
        return this.paginationService.paginate<BookingResponseDto>(
            this.databaseService.booking,
            { page, limit },
            {
                where: { ...(status ? { status } : {}) },
                orderBy: { createdAt: 'desc' },
            }
        );
    }

    public async updateBookingStatus(
        id: string,
        status: BookingStatus
    ): Promise<BookingResponseDto> {
        const booking = await this.databaseService.booking.findUnique({ where: { id } });
        if (!booking) {
            throw new HttpException('booking.error.notFound', HttpStatus.NOT_FOUND);
        }
        return (await this.databaseService.booking.update({
            where: { id },
            data: { status },
        })) as BookingResponseDto;
    }
}
