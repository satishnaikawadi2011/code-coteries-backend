import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

@InputType()
export class EditExperienceInput {
	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	title: string;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	company: string;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	location: string;

	@Field({ nullable: true })
	@IsDateString()
	@IsOptional()
	from: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsDateString()
	to: string;

	@Field({ defaultValue: false })
	@IsBoolean()
	@IsOptional()
	current: boolean;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	description: string;
}
