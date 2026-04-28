import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/modules/user/user.module';
import { BookingModule } from 'src/modules/booking/booking.module';
import { ConsultantApplicationModule } from 'src/modules/consultant-application/consultant-application.module';

import { HealthController } from './controllers/health.controller';
@Module({
    imports: [
        // Shared Common Services
        CommonModule,

        // Health Check
        TerminusModule,

        // Feature Modules
        UserModule,
        BookingModule,
        ConsultantApplicationModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
