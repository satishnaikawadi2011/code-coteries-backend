import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDateString, IsString } from 'class-validator';

@InputType()
export class GetFeedInput {
	@Field((type) => Int, { nullable: true })
	limit?: number | undefined;

	@Field()
	@IsDateString()
	lastTimestamp: string;

	@IsString({ each: true })
	@Field((type) => [
		String
	])
	feedIds: string[] = [];
}
