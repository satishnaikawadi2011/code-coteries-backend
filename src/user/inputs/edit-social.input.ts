import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class EditSocialInput {
	@Field({ nullable: true })
	@IsUrl()
	@IsOptional()
	youtube?: string;

	@Field({ nullable: true })
	@IsUrl()
	@IsOptional()
	twitter?: string;

	@IsUrl()
	@Field({ nullable: true })
	@IsOptional()
	instagram?: string;

	@Field({ nullable: true })
	@IsUrl()
	@IsOptional()
	facebook?: string;

	@IsUrl()
	@Field({ nullable: true })
	@IsOptional()
	linkedin?: string;
}
