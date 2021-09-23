import { Field, InputType } from '@nestjs/graphql';
import { IsEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class EditProfileInput {
	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	company: string;

	@Field({ nullable: true })
	@IsUrl()
	@IsOptional()
	website: string;

	@IsString()
	@Field({ nullable: true })
	@IsOptional()
	location: string;

	@Field({ nullable: true })
	@IsUrl()
	@IsOptional()
	github: string;

	@IsString()
	@Field({ nullable: true })
	@IsOptional()
	bio: string;

	@Field({ nullable: true })
	@IsUrl()
	@IsOptional()
	image_url: string;
}
