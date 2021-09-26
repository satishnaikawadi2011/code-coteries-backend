import { Field, InputType } from '@nestjs/graphql';
import { IsDateString, IsString, IsUrl } from 'class-validator';

@InputType()
export class AddEventInput {
	@Field()
	@IsString()
	title: string;

	@Field()
	@IsString()
	description: string;

	@IsUrl()
	@Field()
	image_url: string;

	@IsUrl()
	@Field()
	event_url: string;

	@IsDateString()
	@Field()
	event_date: string;
}
