import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';
import { PublicRoute } from 'src/common/request/decorators/request.public.decorator';

import { ConsultantApplicationCreateDto } from '../dtos/request/consultant-application.create.request';
import { ConsultantApplicationResponseDto } from '../dtos/response/consultant-application.response';
import { ConsultantApplicationService } from '../services/consultant-application.service';

@ApiTags('public.consultant-application')
@Controller({ path: '/consultant-applications', version: '1' })
export class ConsultantApplicationPublicController {
    constructor(
        private readonly consultantApplicationService: ConsultantApplicationService
    ) {}

    @Post()
    @PublicRoute()
    @ApiOperation({ summary: 'Submit consultant application' })
    @DocResponse({
        serialization: ConsultantApplicationResponseDto,
        httpStatus: HttpStatus.CREATED,
        messageKey: 'consultantApplication.success.created',
    })
    public create(
        @Body() payload: ConsultantApplicationCreateDto
    ): Promise<ConsultantApplicationResponseDto> {
        return this.consultantApplicationService.create(payload);
    }
}
