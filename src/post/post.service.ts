import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComment } from 'src/comment/entities/post-comment.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { TagService } from 'src/tag/tag.service';
import { UserService } from 'src/user/user.service';
import { FindManyOptions, FindOneOptions, getManager, In, LessThan, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './input/create-post.input';

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post) private repo: Repository<Post>,
		private userService: UserService,
		private tagService: TagService
	) {}

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	create(createPostInput: CreatePostInput) {
		const post = this.repo.create(createPostInput);
		return this.repo.save(post);
	}

	findOne(id: string, options?: FindOneOptions<Post>) {
		if (!id) return null;
		return this.repo.findOne(id, options);
	}

	find(options?: FindManyOptions<Post>) {
		return this.repo.find(options);
	}

	async remove(id: string) {
		const post = await this.findOne(id);
		if (!post) {
			throw new NotFoundException('Post not found!');
		}
		await this.repo.remove(post);
		return;
	}

	async save(post: Post) {
		const savedPost = await this.repo.save(post);
		return savedPost;
	}

	async getPostOwner(post: Post) {
		const user = await this.userService.find({ username: post.handle });
		return user[0];
	}

	// Save new comment to post
	async saveCommentToPost(id: string, comment: PostComment): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(Post, 'comments').of(id).add(comment);
		} catch (err) {
			throw err;
		}
	}

	// Get all posts for generic feed; with pagination
	async getAllPosts(skip = 0, take = 10): Promise<Post[]> {
		try {
			return await this.repo
				.createQueryBuilder('post')
				.leftJoinAndSelect('post.comments', 'comments')
				.orderBy('post.created_at', 'DESC')
				.skip(skip)
				.take(take)
				.getMany();
		} catch (err) {
			throw err;
		}
	}

	// get feed posts
	async getFeed(limit: number, feedIds: string[], lastTimestamp?: string) {
		const posts = await this.repo.find({
			where:
				{
					user:
						{
							id: In(feedIds)
						},
					created_at: LessThan(lastTimestamp)
				},
			take: limit,
			order:
				{
					created_at: 'DESC'
				}
		});

		return posts;
	}

	//   Get post by postId
	async getPostById(id: string): Promise<Post> {
		try {
			const post = await this.repo
				.createQueryBuilder('post')
				.leftJoinAndSelect('post.comments', 'comments')
				.where('post.id = :id', { id })
				.getOne();
			return post;
		} catch (err) {
			throw err;
		}
	}

	//   Create a new post
	async createPost({ caption, image_url, tagIds }: CreatePostInput, userId: string): Promise<Post> {
		try {
			// Find user by id
			const user = await this.userService.findOne(userId);
			const insertResult = await this.repo
				.createQueryBuilder()
				.insert()
				.into(Post)
				.values([
					{
						handle: user.username,
						likes: [],
						user,
						caption,
						image_url
					}
				])
				.execute();
			const postId = insertResult.identifiers[0].id;
			const newPost = await this.findOne(postId);

			// Pass newly created post to profile
			await this.userService.savePostToUser(user.id, newPost);

			// if user has attached some tags to the post
			if (tagIds && tagIds.length !== 0) {
				const tags = await this.tagService.find({ where: { id: In(tagIds) } });
				tags.forEach(async (tag) => {
					await this.saveTagToPost(postId, tag);
				});
			}

			return newPost;
		} catch (err) {
			throw err;
		}
	}

	async getTagsOfPost(postId: string) {
		const post = await this.findOne(postId, {
			relations:
				[
					'tags'
				]
		});
		return post.tags;
	}

	//   like/dislike post
	async likePost(postId: string, userId: string): Promise<Post> {
		try {
			const post = await this.findOne(postId);
			// check if userId has already liked post
			if (post.likes.some((like) => like === userId)) {
				// unlike
				post.likes.splice(post.likes.indexOf(userId), 1);
				return await this.repo.save(post);
			}
			else {
				post.likes.push(userId);
				return await this.repo.save(post);
			}
		} catch (err) {
			throw err;
		}
	}

	// add tag to post
	async saveTagToPost(id: string, tag: Tag): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(Post, 'tags').of(id).add(tag);
		} catch (err) {
			throw err;
		}
	}

	// all posts related to particular tag
	async getAllPostsRelatedToTag(tagId: string) {
		const posts = await this.runRawQuery(
			`
			SELECT * FROM post p
			INNER JOIN tag_posts_post tp
			ON tp.tagId = ? AND tp.postId = p.id
		`,
			[
				tagId
			]
		);
		return posts;
	}
}
