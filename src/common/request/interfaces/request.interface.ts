import { Role } from '../enums/role.enum';

export interface IAuthUser {
    userId: string;
    role: Role;
}

export interface IRequest {
    user?: IAuthUser;
}
