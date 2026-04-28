import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

import { DatabaseService } from 'src/common/database/services/database.service';
import { HelperPaginationService } from 'src/common/helper/services/helper.pagination.service';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';

import { ConsultantApplicationCreateDto } from '../dtos/request/consultant-application.create.request';
import { ConsultantApplicationResponseDto } from '../dtos/response/consultant-application.response';

@Injectable()
export class ConsultantApplicationService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly paginationService: HelperPaginationService
    ) {}

    public create(
        data: ConsultantApplicationCreateDto
    ): Promise<ConsultantApplicationResponseDto> {
        return this.databaseService.consultantApplication.create({
            data,
        }) as Promise<ConsultantApplicationResponseDto>;
    }

    public list(
        page = 1,
        limit = 10,
        status?: ApplicationStatus
    ): Promise<ApiPaginatedDataDto<ConsultantApplicationResponseDto>> {
        return this.paginationService.paginate<ConsultantApplicationResponseDto>(
            this.databaseService.consultantApplication,
            { page, limit },
            {
                where: { ...(status ? { status } : {}) },
                orderBy: { createdAt: 'desc' },
            }
        );
    }

    public async updateStatus(
        id: string,
        status: ApplicationStatus,
        reviewNotes?: string
    ): Promise<ConsultantApplicationResponseDto> {
        const existing = await this.databaseService.consultantApplication.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new HttpException(
                'consultantApplication.error.notFound',
                HttpStatus.NOT_FOUND
            );
        }
        return (await this.databaseService.consultantApplication.update({
            where: { id },
            data: {
                status,
                reviewNotes: reviewNotes ?? null,
                reviewedAt: new Date(),
            },
        })) as ConsultantApplicationResponseDto;
    }
}
