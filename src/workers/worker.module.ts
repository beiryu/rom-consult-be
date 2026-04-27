import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { APP_BULL_QUEUES } from 'src/app/enums/app.enum';
import { DatabaseModule } from 'src/common/database/database.module';
import { HelperModule } from 'src/common/helper/helper.module';

@Module({
    imports: [
        HelperModule,
        DatabaseModule,
        BullModule.registerQueue({
            name: APP_BULL_QUEUES.NOTIFICATION,
        }),
    ],
    providers: [],
    exports: [],
})
export class WorkerModule {}
