import { Controller, Get, HttpStatus, Param, Patch, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { DocPaginatedResponse } from 'src/common/doc/decorators/doc.paginated.decorator';
import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';
import { AllowedRoles } from 'src/common/request/decorators/request.role.decorator';
import { Role } from 'src/common/request/enums/role.enum';
import { QueryTransformPipe } from 'src/common/request/pipes/query-transform.pipe';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';

import { BookingResponseDto } from '../dtos/response/booking.response';
import { BookingService } from '../services/booking.service';

class BookingAdminListQueryDto {
    page?: number;
    limit?: number;
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;
}

class BookingStatusUpdateDto {
    @IsEnum(BookingStatus)
    status: BookingStatus;
}

@ApiTags('admin.booking')
@Controller({ path: '/admin/bookings', version: '1' })
export class BookingAdminController {
    constructor(private readonly bookingService: BookingService) {}

    @Get()
    @AllowedRoles([Role.ADMIN, Role.MANAGER])
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'List bookings' })
    @DocPaginatedResponse({
        serialization: BookingResponseDto,
        httpStatus: HttpStatus.OK,
        messageKey: 'booking.success.list',
    })
    public list(
        @Query(new QueryTransformPipe()) query: BookingAdminListQueryDto
    ): Promise<ApiPaginatedDataDto<BookingResponseDto>> {
        return this.bookingService.getAllBookings(query.page, query.limit, query.status);
    }

    @Patch(':id/status')
    @AllowedRoles([Role.ADMIN, Role.MANAGER])
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'Update booking status' })
    @DocResponse({
        serialization: BookingResponseDto,
        httpStatus: HttpStatus.OK,
        messageKey: 'booking.success.updated',
    })
    public updateStatus(
        @Param('id') id: string,
        @Body() payload: BookingStatusUpdateDto
    ): Promise<BookingResponseDto> {
        return this.bookingService.updateBookingStatus(id, payload.status);
    }
}
