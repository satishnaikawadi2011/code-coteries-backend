import { BadRequestException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { SigninUserInput } from './inputs/signin-user.input';
import { AuthResponse } from './types/auth-response.type';
import { UserService } from './user.service';

@Resolver((of) => User)
export class UserResolver {
	constructor(private usersService: UserService, private authService: AuthService) {}

	@Query((returns) => User)
	@UseGuards(AuthGuard)
	async me(@Context('userId') userId: string): Promise<User> {
		const user = await this.usersService.findOne(userId);
		if (!user) {
			throw new BadRequestException('user with given id not found!');
		}
		return user;
	}

	@Mutation((returns) => AuthResponse)
	async registerUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<AuthResponse> {
		return this.authService.signup(createUserInput);
	}

	@Mutation((returns) => AuthResponse)
	async signinUser(@Args('signinUserInput') signinUserInput: SigninUserInput): Promise<AuthResponse> {
		return this.authService.signin(signinUserInput);
	}
}
