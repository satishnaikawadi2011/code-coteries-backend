import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDateString, IsString } from 'class-validator';

@InputType()
export class SuggestUsersInput {
	@Field((type) => Int, { nullable: true })
	limit?: number | undefined;

	@Field()
	@IsDateString()
	created_at: string;

	@IsString({ each: true })
	@Field((type) => [
		String
	])
	followerIds: string[] = [];
}
