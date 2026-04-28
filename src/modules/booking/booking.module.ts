import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/common/database/database.module';
import { HelperModule } from 'src/common/helper/helper.module';
import { RequestModule } from 'src/common/request/request.module';

import { BookingPublicController } from './controllers/booking.public.controller';
import { BookingAdminController } from './controllers/booking.admin.controller';
import { BookingService } from './services/booking.service';

@Module({
    imports: [DatabaseModule, HelperModule, RequestModule],
    controllers: [BookingPublicController, BookingAdminController],
    providers: [BookingService],
    exports: [BookingService],
})
export class BookingModule {}
