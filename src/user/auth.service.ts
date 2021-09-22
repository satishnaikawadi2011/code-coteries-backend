import { SigninUserInput } from './inputs/signin-user.input';
import { CreateUserInput } from './inputs/create-user.input';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private usersService: UserService,
		private jwtService: JwtService
	) {}

	async signup({ email, password, username }: CreateUserInput): Promise<AuthResponse> {
		const isExistAlready = await this.usersService.findByEmailOrUsername(email, username);
		if (isExistAlready.length) {
			throw new BadRequestException('User with this email or username already exists !!');
		}
		const hashedPassword = await argon2.hash(password);
		const user = await this.usersService.create({ email, password: hashedPassword, username });
		const token = await this.jwtService.signAsync({ id: user.id });
		return { user, token };
	}

	async signin({ password, username }: SigninUserInput): Promise<AuthResponse> {
		const [
			user
		] = await this.usersService.find({ username });

		if (!user) {
			throw new NotFoundException('User not found !');
		}

		const isValid = await argon2.verify(user.password, password);

		if (!isValid) {
			throw new BadRequestException('Invalid credentials !');
		}

		const token = await this.jwtService.signAsync({ id: user.id });

		return { user, token };
	}
}
