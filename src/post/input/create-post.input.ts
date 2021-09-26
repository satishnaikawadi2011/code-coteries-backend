import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUrl } from 'class-validator';

@InputType()
export class CreatePostInput {
	@Field()
	@IsString()
	caption: string;

	@IsUrl()
	@Field()
	image_url: string;
}
