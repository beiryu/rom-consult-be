import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';

import { CommonModule } from 'src/common/common.module';
import { StorageModule } from 'src/common/storage/storage.module';

import { ProductsSeedService } from './seed/products.seed';
import { UsersSeedService } from './seed/users.seed';

@Module({
    imports: [CommonModule, CommandModule, StorageModule],
    providers: [ProductsSeedService, UsersSeedService],
    exports: [ProductsSeedService, UsersSeedService],
})
export class MigrationModule {}
