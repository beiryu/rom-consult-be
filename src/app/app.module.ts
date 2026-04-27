import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/modules/user/user.module';

import { HealthController } from './controllers/health.controller';
@Module({
    imports: [
        // Shared Common Services
        CommonModule,

        // Health Check
        TerminusModule,

        // Feature Modules
        UserModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
