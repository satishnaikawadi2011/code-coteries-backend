import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserService } from 'src/user/user.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './input/create-post.input';
import { PostService } from './post.service';

@Resolver((of) => Post)
export class PostResolver {
	constructor(private userService: UserService, private postService: PostService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Post)
	async createPost(
		@Args('createPostInput') createPostInput: CreatePostInput,
		@Context('userId') userId: string
	): Promise<Post> {
		return this.postService.createPost(createPostInput, userId);
	}
}
