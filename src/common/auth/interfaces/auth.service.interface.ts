import { IAuthUser } from 'src/common/request/interfaces/request.interface';

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

export interface IAuthService {
    login(data: UserLoginDto): Promise<AuthResponseDto>;
    signup(data: UserCreateDto): Promise<AuthResponseDto>;
    logout(): Promise<{ success: boolean; message: string }>;
    refreshTokens(payload: IAuthUser): Promise<AuthRefreshResponseDto>;
    forgotPassword(data: ForgotPasswordDto): Promise<AuthSuccessResponseDto>;
    forgotPasswordLink(
        data: ForgotPasswordDto
    ): Promise<AuthSuccessResponseDto>;
    verifyOtp(data: VerifyOtpDto): Promise<AuthSuccessResponseDto>;
    resetPassword(data: ResetPasswordDto): Promise<AuthSuccessResponseDto>;
    resetPasswordLink(
        data: ResetPasswordLinkDto
    ): Promise<AuthSuccessResponseDto>;
    changePassword(
        userId: string,
        data: ChangePasswordDto
    ): Promise<AuthSuccessResponseDto>;
    sendVerificationEmail(userId: string): Promise<AuthSuccessResponseDto>;
    verifyEmail(token: string): Promise<AuthSuccessResponseDto>;
}
