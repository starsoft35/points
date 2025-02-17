import { Document } from 'mongoose';

export interface User extends Document {
    readonly firstName: string;
    readonly lastName: string;
    readonly userName: string;
    password: string;
    readonly roles: string[];
    photo: string;
}
