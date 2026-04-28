import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';
import { HelperModule } from 'src/common/helper/helper.module';
import { RequestModule } from 'src/common/request/request.module';

import { ConsultantApplicationPublicController } from './controllers/consultant-application.public.controller';
import { ConsultantApplicationAdminController } from './controllers/consultant-application.admin.controller';
import { ConsultantApplicationService } from './services/consultant-application.service';

@Module({
    imports: [DatabaseModule, HelperModule, RequestModule],
    controllers: [
        ConsultantApplicationPublicController,
        ConsultantApplicationAdminController,
    ],
    providers: [ConsultantApplicationService],
    exports: [ConsultantApplicationService],
})
export class ConsultantApplicationModule {}
