import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, ResolveField, Resolver, Int, Parent } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { CommentService } from './comment.service';
import { EventComment } from './entities/event-comment.entity';
import { PostComment } from './entities/post-comment.entity';
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
}
