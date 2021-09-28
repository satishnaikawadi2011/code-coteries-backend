import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { CommentType } from 'src/utils/types';
import { CommentService } from './comment.service';
import { AddCommentInput } from './input/add-comment';
import { CommentResponse } from './types/comment-res';

@Resolver()
export class CommentResolver {
	constructor(private commentService: CommentService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => CommentResponse)
	async addComment(@Args('addCommentInput') addCommentInput: AddCommentInput, @Context('userId') userId: string) {
		return this.commentService.createComment(addCommentInput, userId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => CommentResponse)
	async likeComment(
		@Args('commentId') commentId: string,
		@Args('type') type: CommentType,
		@Context('userId') userId: string
	): Promise<CommentResponse> {
		return this.commentService.likeComment(commentId, userId, type);
	}
}
