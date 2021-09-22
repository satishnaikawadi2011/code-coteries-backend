import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class SigninUserInput {
	@Field()
	@MinLength(3)
	@IsString()
	username: string;

	@IsString()
	@MinLength(6)
	@MaxLength(12)
	@Field()
	password: string;
}
