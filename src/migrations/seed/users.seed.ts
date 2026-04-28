import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Command } from 'nestjs-command';
import { PinoLogger } from 'nestjs-pino';
import { DatabaseService } from 'src/common/database/services/database.service';

const SEED_EMAIL = 'user@romconsult';
/** Meets public login password rules (upper, lower, digit, special, 8+). */
const SEED_PASSWORD = 'Test1234!';

@Injectable()
export class UsersSeedService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly databaseService: DatabaseService
    ) {
        this.logger.setContext(UsersSeedService.name);
    }

    @Command({
        command: 'seed:users',
        describe: 'Seed one dev user (verified, full profile)',
    })
    async seed(): Promise<void> {
        const existing = await this.databaseService.user.findUnique({
            where: { email: SEED_EMAIL },
        });

        if (existing) {
            this.logger.info(
                { email: SEED_EMAIL },
                'User already exists; skipping seed'
            );
            return;
        }

        const password = await argon2.hash(SEED_PASSWORD);

        const user = await this.databaseService.user.create({
            data: {
                userName: 'seed',
                email: SEED_EMAIL,
                password,
                firstName: 'Seed',
                lastName: 'User',
                isVerified: true,
            },
        });

        this.logger.info(
            {
                userId: user.id,
                email: SEED_EMAIL,
                password: SEED_PASSWORD,
            },
            'Seeded user (password shown for local dev only)'
        );
    }
}
