import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateTagInput {
	@Field()
	@IsString()
	name: string;

	@IsString()
	@Field()
	description: string;
}
