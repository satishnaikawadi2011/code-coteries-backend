import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

@InputType()
export class AddEducationInput {
	@Field()
	@IsString()
	field: string;

	@Field()
	@IsString()
	school: string;

	@Field()
	@IsString()
	degree: string;

	@Field()
	@IsDateString()
	from: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsDateString()
	to: string | null;

	@Field({ defaultValue: false })
	@IsBoolean()
	current: boolean;

	@Field()
	@IsString()
	description: string;
}
