import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { SigninUserInput } from './inputs/signin-user.input';
import { AuthResponse } from './types/auth-response.type';
import { UserService } from './user.service';

@Resolver((of) => User)
export class UserResolver {
	constructor(private usersService: UserService, private authService: AuthService) {}

	@Query(() => String)
	helloWorld() {
		return 'Hello World !!!';
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
