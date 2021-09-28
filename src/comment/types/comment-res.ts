import { Field, ObjectType } from '@nestjs/graphql';
import { EventComment } from '../entities/event-comment.entity';
import { PostComment } from '../entities/post-comment.entity';

@ObjectType()
export class CommentResponse {
	@Field((type) => PostComment, { nullable: true })
	postComment: PostComment | EventComment;

	@Field((type) => EventComment, { nullable: true })
	eventComment: EventComment | PostComment;
}
