import { CommentType } from './../../utils/types';
import { IsString } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddCommentInput {
	@Field()
	@IsString()
	content: string;

	@Field((returns) => String)
	@IsString()
	commentType: CommentType;

	@Field()
	@IsString()
	entityId: string;
}
