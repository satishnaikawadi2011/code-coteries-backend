import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

@InputType()
export class AddExperienceInput {
	@Field()
	@IsString()
	title: string;

	@Field()
	@IsString()
	company: string;

	@Field()
	@IsString()
	location: string;

	@Field()
	@IsDateString()
	from: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsDateString()
	to: string;

	@Field({ defaultValue: false })
	@IsBoolean()
	current: boolean;

	@Field()
	@IsString()
	description: string;
}
