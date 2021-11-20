import { UseGuards, BadRequestException } from '@nestjs/common';
import { Args, Context, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './input/create-post.input';
import { PostService } from './post.service';

@Resolver((of) => Post)
export class PostResolver {
	constructor(private userService: UserService, private postService: PostService) {}

	@UseGuards(AuthGuard)
	@Query((returns) => Post)
	async getPost(@Args('postId') postId: string): Promise<Post> {
		return this.postService.getPostById(postId);
	}

	// @UseGuards(AuthGuard)
	@Query((returns) => [
		Post
	])
	async getAllPosts(
		@Args('skip', { nullable: true })
		skip?: number,
		@Args('take', { nullable: true })
		take?: number
	): Promise<Post[]> {
		return this.postService.getAllPosts(skip, take);
	}

	// @UseGuards(AuthGuard)
	@Query((returns) => [
		Post
	])
	async getPostsByTag(@Args('tagId') tagId: string): Promise<Post[]> {
		return this.postService.getAllPostsRelatedToTag(tagId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Post)
	async createPost(
		@Args('createPostInput') createPostInput: CreatePostInput,
		@Context('userId') userId: string
	): Promise<Post> {
		return this.postService.createPost(createPostInput, userId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => String)
	async deletePost(@Args('postId') postId: string, @Context('userId') userId: string): Promise<string> {
		const post = await this.postService.getPostById(postId);
		if (!post) {
			throw new BadRequestException('Post not found !');
		}
		await this.userService.removePostFromUser(postId, post);
		await this.postService.remove(postId);
		return postId;
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Post)
	async likePost(@Args('postId') postId: string, @Context('userId') userId: string): Promise<Post> {
		return this.postService.likePost(postId, userId);
	}

	@ResolveField((returns) => User)
	async user(@Parent() post: Post): Promise<User> {
		return this.postService.getPostOwner(post);
	}

	@ResolveField((returns) => [
		Tag
	])
	tags(@Parent() post: Post): Promise<Tag[]> {
		return this.postService.getTagsOfPost(post.id);
	}

	@ResolveField((returns) => Int)
	async likeCount(@Parent() post: Post): Promise<number> {
		return post.likes.length;
	}
}
