import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DocPaginatedResponse } from 'src/common/doc/decorators/doc.paginated.decorator';
import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';
import { AuthUser } from 'src/common/request/decorators/request.user.decorator';
import { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { QueryTransformPipe } from 'src/common/request/pipes/query-transform.pipe';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';

import { BookingCreateDto } from '../dtos/request/booking.create.request';
import { BookingResponseDto } from '../dtos/response/booking.response';
import { BookingService } from '../services/booking.service';

class BookingListQueryDto {
    page?: number;
    limit?: number;
}

@ApiTags('public.booking')
@Controller({ path: '/bookings', version: '1' })
export class BookingPublicController {
    constructor(private readonly bookingService: BookingService) {}

    @Post()
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'Create booking' })
    @DocResponse({
        serialization: BookingResponseDto,
        httpStatus: HttpStatus.CREATED,
        messageKey: 'booking.success.created',
    })
    public create(
        @AuthUser() user: IAuthUser,
        @Body() payload: BookingCreateDto
    ): Promise<BookingResponseDto> {
        return this.bookingService.createBooking(user.userId, payload);
    }

    @Get()
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'List user bookings' })
    @DocPaginatedResponse({
        serialization: BookingResponseDto,
        httpStatus: HttpStatus.OK,
        messageKey: 'booking.success.list',
    })
    public list(
        @AuthUser() user: IAuthUser,
        @Query(new QueryTransformPipe()) query: BookingListQueryDto
    ): Promise<ApiPaginatedDataDto<BookingResponseDto>> {
        return this.bookingService.getUserBookings(user.userId, query.page, query.limit);
    }

    @Get(':id')
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'Get booking detail' })
    @DocResponse({
        serialization: BookingResponseDto,
        httpStatus: HttpStatus.OK,
        messageKey: 'booking.success.found',
    })
    public detail(
        @AuthUser() user: IAuthUser,
        @Param('id') id: string
    ): Promise<BookingResponseDto> {
        return this.bookingService.getUserBooking(id, user.userId);
    }
}
