import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

@InputType()
export class EditEducationInput {
	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	field: string;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	school: string;

	@Field({ nullable: true })
	@IsString()
	@IsOptional()
	degree: string;

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
