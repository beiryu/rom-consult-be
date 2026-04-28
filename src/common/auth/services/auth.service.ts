import { randomInt, randomUUID } from 'crypto';

import { faker } from '@faker-js/faker';
import { InjectQueue } from '@nestjs/bull';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';

import { APP_BULL_QUEUES } from 'src/app/enums/app.enum';
import { DatabaseService } from 'src/common/database/services/database.service';
import { EMAIL_TEMPLATES } from 'src/common/email/enums/email-template.enum';
import {
    IForgotPasswordOtpPayload,
    IResetPasswordLinkPayload,
    ISendEmailBasePayload,
    IVerifyEmailPayload,
    IWelcomeEmailDataPayload,
} from 'src/common/helper/interfaces/email.interface';

import { HelperEncryptionService } from '../../helper/services/helper.encryption.service';
import { IAuthUser } from '../../request/interfaces/request.interface';
import { Role } from '../../request/enums/role.enum';
import { UserService } from 'src/modules/user/services/user.service';
import { ChangePasswordDto } from '../dtos/request/auth.change-password.dto';
import { ForgotPasswordDto } from '../dtos/request/auth.forgot-password.dto';
import { UserLoginDto } from '../dtos/request/auth.login.dto';
import { ResetPasswordLinkDto } from '../dtos/request/auth.reset-password-link.dto';
import { ResetPasswordDto } from '../dtos/request/auth.reset-password.dto';
import { UserCreateDto } from '../dtos/request/auth.signup.dto';
import { VerifyOtpDto } from '../dtos/request/auth.verify-otp.dto';
import {
    AuthRefreshResponseDto,
    AuthResponseDto,
    AuthSuccessResponseDto,
} from '../dtos/response/auth.response.dto';
import { IAuthService } from '../interfaces/auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly helperEncryptionService: HelperEncryptionService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        @InjectQueue(APP_BULL_QUEUES.EMAIL)
        private emailQueue: Queue,
        @InjectQueue(APP_BULL_QUEUES.NOTIFICATION)
        private notificationQueue: Queue
    ) {}

    public async login(
        data: UserLoginDto
    ): Promise<AuthResponseDto> {
        try {
            const { email, password } = data;

            const user = await this.databaseService.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new HttpException(
                    'user.error.userNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            if (user.deletedAt) {
                throw new HttpException(
                    'auth.error.accountDeleted',
                    HttpStatus.FORBIDDEN
                );
            }

            const passwordMatched = await this.helperEncryptionService.match(
                user.password,
                password
            );

            if (!passwordMatched) {
                throw new HttpException(
                    'auth.error.invalidPassword',
                    HttpStatus.BAD_REQUEST
                );
            }

            const tokens = await this.helperEncryptionService.createJwtTokens({
                role: Role.USER,
                userId: user.id,
            });

            return {
                ...tokens,
                user,
            };
        } catch (error) {
            throw error;
        }
    }

    public async signup(data: UserCreateDto): Promise<AuthResponseDto> {
        try {
            const { email, firstName, lastName, password } = data;

            const existingUser = await this.databaseService.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                throw new HttpException(
                    'user.error.userExists',
                    HttpStatus.CONFLICT
                );
            }

            const hashed =
                await this.helperEncryptionService.createHash(password);

            const createdUser = await this.databaseService.user.create({
                data: {
                    email,
                    password: hashed,
                    firstName: firstName?.trim(),
                    lastName: lastName?.trim(),
                    userName: faker.internet.username(),
                },
            });

            const tokens = await this.helperEncryptionService.createJwtTokens({
                role: Role.USER,
                userId: createdUser.id,
            });

            this.emailQueue.add(
                EMAIL_TEMPLATES.WELCOME_EMAIL,
                {
                    data: {
                        userName: createdUser.userName,
                    },
                    toEmails: [email],
                } as ISendEmailBasePayload<IWelcomeEmailDataPayload>,
                { delay: 15000 }
            );

            // Trigger welcome notification
            // this.notificationQueue.add('welcome', {
            //     userId: createdUser.id,
            // });

            return {
                ...tokens,
                user: createdUser,
            };
        } catch (error) {
            throw error;
        }
    }

    public async logout(): Promise<{ success: boolean; message: string }> {
        return {
            success: true,
            message: 'auth.success.logout',
        };
    }

    public async refreshTokens(
        payload: IAuthUser
    ): Promise<AuthRefreshResponseDto> {
        return this.helperEncryptionService.createJwtTokens({
            userId: payload.userId,
            role: payload.role,
        });
    }

    public async forgotPassword(
        data: ForgotPasswordDto
    ): Promise<AuthSuccessResponseDto> {
        const user = await this.databaseService.user.findUnique({
            where: { email: data.email },
        });

        if (!user || user.deletedAt) {
            return {
                success: true,
                message: 'auth.success.forgotPassword',
            };
        }

        const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
        const passwordResetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await this.databaseService.user.update({
            where: { id: user.id },
            data: {
                passwordResetOtp: otp,
                passwordResetOtpExpiry,
            },
        });

        this.emailQueue.add(EMAIL_TEMPLATES.FORGOT_PASSWORD_OTP, {
            data: {
                otp,
                userName: user.userName,
            },
            toEmails: [user.email],
        } as ISendEmailBasePayload<IForgotPasswordOtpPayload>);

        return {
            success: true,
            message: 'auth.success.forgotPassword',
        };
    }

    public async forgotPasswordLink(
        data: ForgotPasswordDto
    ): Promise<AuthSuccessResponseDto> {
        const user = await this.databaseService.user.findUnique({
            where: { email: data.email },
        });

        if (!user || user.deletedAt) {
            return {
                success: true,
                message: 'auth.success.forgotPassword',
            };
        }

        const token = randomUUID();
        const passwordResetOtpExpiry = new Date(Date.now() + 60 * 60 * 1000);

        await this.databaseService.user.update({
            where: { id: user.id },
            data: {
                passwordResetOtp: token,
                passwordResetOtpExpiry,
            },
        });

        const frontendUrl =
            this.configService.get<string>('app.frontendUrl') ??
            'http://localhost:3000';
        const resetUrl = `${frontendUrl.replace(/\/$/, '')}/auth/reset-password?token=${token}`;

        this.emailQueue.add(EMAIL_TEMPLATES.RESET_PASSWORD_LINK, {
            data: {
                resetUrl,
                userName: user.userName,
            },
            toEmails: [user.email],
        } as ISendEmailBasePayload<IResetPasswordLinkPayload>);

        return {
            success: true,
            message: 'auth.success.forgotPassword',
        };
    }

    public async verifyOtp(
        data: VerifyOtpDto
    ): Promise<AuthSuccessResponseDto> {
        const user = await this.databaseService.user.findUnique({
            where: { email: data.email },
        });

        if (!user || user.deletedAt) {
            throw new HttpException(
                'user.error.userNotFound',
                HttpStatus.NOT_FOUND
            );
        }

        this.assertValidPasswordResetOtp(user, data.otp);

        return {
            success: true,
            message: 'auth.success.otpVerified',
        };
    }

    public async resetPassword(
        data: ResetPasswordDto
    ): Promise<AuthSuccessResponseDto> {
        const user = await this.databaseService.user.findUnique({
            where: { email: data.email },
        });

        if (!user || user.deletedAt) {
            throw new HttpException(
                'user.error.userNotFound',
                HttpStatus.NOT_FOUND
            );
        }

        this.assertValidPasswordResetOtp(user, data.otp);

        const hashed = await this.helperEncryptionService.createHash(
            data.newPassword
        );

        await this.databaseService.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                passwordResetOtp: null,
                passwordResetOtpExpiry: null,
            },
        });

        return {
            success: true,
            message: 'auth.success.passwordReset',
        };
    }

    public async resetPasswordLink(
        data: ResetPasswordLinkDto
    ): Promise<AuthSuccessResponseDto> {
        const user = await this.databaseService.user.findFirst({
            where: {
                passwordResetOtp: data.token,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new HttpException(
                'auth.error.invalidOrExpiredResetOtp',
                HttpStatus.BAD_REQUEST
            );
        }

        if (
            !user.passwordResetOtpExpiry ||
            user.passwordResetOtpExpiry <= new Date()
        ) {
            throw new HttpException(
                'auth.error.invalidOrExpiredResetOtp',
                HttpStatus.BAD_REQUEST
            );
        }

        const hashed = await this.helperEncryptionService.createHash(
            data.newPassword
        );

        await this.databaseService.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                passwordResetOtp: null,
                passwordResetOtpExpiry: null,
            },
        });

        return {
            success: true,
            message: 'auth.success.passwordReset',
        };
    }

    public async changePassword(
        userId: string,
        data: ChangePasswordDto
    ): Promise<AuthSuccessResponseDto> {
        const user = await this.databaseService.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deletedAt) {
            throw new HttpException(
                'user.error.userNotFound',
                HttpStatus.NOT_FOUND
            );
        }

        const passwordMatched = await this.helperEncryptionService.match(
            user.password,
            data.currentPassword
        );

        if (!passwordMatched) {
            throw new HttpException(
                'auth.error.invalidPassword',
                HttpStatus.BAD_REQUEST
            );
        }

        const hashed = await this.helperEncryptionService.createHash(
            data.newPassword
        );

        await this.databaseService.user.update({
            where: { id: userId },
            data: { password: hashed },
        });

        return {
            success: true,
            message: 'auth.success.passwordChanged',
        };
    }

    public async sendVerificationEmail(
        userId: string
    ): Promise<AuthSuccessResponseDto> {
        const user = await this.databaseService.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deletedAt) {
            throw new HttpException(
                'user.error.userNotFound',
                HttpStatus.NOT_FOUND
            );
        }

        if (user.isVerified) {
            throw new HttpException(
                'auth.error.emailAlreadyVerified',
                HttpStatus.BAD_REQUEST
            );
        }

        const emailToken = randomUUID();
        const emailVerificationTokenExpiry = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        await this.databaseService.user.update({
            where: { id: userId },
            data: {
                emailVerificationToken: emailToken,
                emailVerificationTokenExpiry,
            },
        });

        const frontendUrl =
            this.configService.get<string>('app.frontendUrl') ??
            'http://localhost:3000';
        const verificationUrl = `${frontendUrl.replace(/\/$/, '')}/auth/verify-email?token=${emailToken}`;

        this.emailQueue.add(EMAIL_TEMPLATES.VERIFY_EMAIL, {
            data: {
                verificationUrl,
                userName: user.userName,
            },
            toEmails: [user.email],
        } as ISendEmailBasePayload<IVerifyEmailPayload>);

        return {
            success: true,
            message: 'auth.success.verificationEmailSent',
        };
    }

    public async verifyEmail(token: string): Promise<AuthSuccessResponseDto> {
        const user = await this.databaseService.user.findFirst({
            where: { emailVerificationToken: token },
        });

        if (!user) {
            throw new HttpException(
                'auth.error.invalidVerificationToken',
                HttpStatus.NOT_FOUND
            );
        }

        if (
            !user.emailVerificationTokenExpiry ||
            user.emailVerificationTokenExpiry <= new Date()
        ) {
            throw new HttpException(
                'auth.error.verificationTokenExpired',
                HttpStatus.BAD_REQUEST
            );
        }

        await this.databaseService.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                emailVerificationToken: null,
                emailVerificationTokenExpiry: null,
            },
        });

        return {
            success: true,
            message: 'auth.success.emailVerified',
        };
    }

    private assertValidPasswordResetOtp(
        user: {
            passwordResetOtp: string | null;
            passwordResetOtpExpiry: Date | null;
        },
        otp: string
    ): void {
        if (
            !user.passwordResetOtp ||
            !user.passwordResetOtpExpiry ||
            user.passwordResetOtp !== otp ||
            user.passwordResetOtpExpiry <= new Date()
        ) {
            throw new HttpException(
                'auth.error.invalidOrExpiredResetOtp',
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
