import { Body, Controller, Get, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationStatus, Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { DocPaginatedResponse } from 'src/common/doc/decorators/doc.paginated.decorator';
import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';
import { AllowedRoles } from 'src/common/request/decorators/request.role.decorator';
import { QueryTransformPipe } from 'src/common/request/pipes/query-transform.pipe';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';

import { ConsultantApplicationResponseDto } from '../dtos/response/consultant-application.response';
import { ConsultantApplicationService } from '../services/consultant-application.service';

class ConsultantApplicationListQueryDto {
    page?: number;
    limit?: number;
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;
}

class ConsultantApplicationStatusUpdateDto {
    @IsEnum(ApplicationStatus)
    status: ApplicationStatus;

    @IsOptional()
    @IsString()
    reviewNotes?: string;
}

@ApiTags('admin.consultant-application')
@Controller({ path: '/admin/consultant-applications', version: '1' })
export class ConsultantApplicationAdminController {
    constructor(
        private readonly consultantApplicationService: ConsultantApplicationService
    ) {}

    @Get()
    @AllowedRoles([Role.ADMIN, Role.MANAGER])
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'List consultant applications' })
    @DocPaginatedResponse({
        serialization: ConsultantApplicationResponseDto,
        httpStatus: HttpStatus.OK,
        messageKey: 'consultantApplication.success.list',
    })
    public list(
        @Query(new QueryTransformPipe()) query: ConsultantApplicationListQueryDto
    ): Promise<ApiPaginatedDataDto<ConsultantApplicationResponseDto>> {
        return this.consultantApplicationService.list(
            query.page,
            query.limit,
            query.status
        );
    }

    @Patch(':id/status')
    @AllowedRoles([Role.ADMIN, Role.MANAGER])
    @ApiBearerAuth('accessToken')
    @ApiOperation({ summary: 'Update consultant application status' })
    @DocResponse({
        serialization: ConsultantApplicationResponseDto,
        httpStatus: HttpStatus.OK,
        messageKey: 'consultantApplication.success.updated',
    })
    public updateStatus(
        @Param('id') id: string,
        @Body() payload: ConsultantApplicationStatusUpdateDto
    ): Promise<ConsultantApplicationResponseDto> {
        return this.consultantApplicationService.updateStatus(
            id,
            payload.status,
            payload.reviewNotes
        );
    }
}
