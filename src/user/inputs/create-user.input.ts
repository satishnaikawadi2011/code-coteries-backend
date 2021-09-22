import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
	@Field()
	@MinLength(3)
	@IsString()
	username: string;

	@IsString()
	@MinLength(6)
	@MaxLength(12)
	@Field()
	password: string;

	@Field()
	@IsEmail()
	email: string;
}
