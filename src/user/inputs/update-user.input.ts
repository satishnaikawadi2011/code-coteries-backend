import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput {
	@Field({ nullable: true })
	@MinLength(3)
	@IsString()
	@IsOptional()
	username?: string;

	@Field({ nullable: true })
	@IsEmail()
	@IsOptional()
	email?: string;
}
