import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComment } from 'src/comment/entities/post-comment.entity';
import { UserService } from 'src/user/user.service';
import { FindManyOptions, FindOneOptions, getManager, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './input/create-post.input';

@Injectable()
export class PostService {
	constructor(@InjectRepository(Post) private repo: Repository<Post>, private userService: UserService) {}

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

	//   Get post by postId
	async getPostById(id: string): Promise<Post> {
		try {
			const post = await this.repo
				.createQueryBuilder('post')
				// .leftJoinAndSelect('post.replies', 'reply')
				.where('post.id = :id', { id })
				.getOne();
			return post;
		} catch (err) {
			throw err;
		}
	}

	//   Get posts by handle; with pagination
	//   async getPostsByHandle(handle: string, skip = 0, take = 10): Promise<Post[]> {
	//     try {
	//       return await this.repo
	//         .createQueryBuilder('post')
	//         .where('handle = :handle', { handle })
	//         .orderBy('post.createdDate', 'DESC')
	//         .skip(skip)
	//         .take(take)
	//         .getMany();
	//     } catch (err) {
	//       throw err;
	//     }
	//   }

	//   Get posts by topic w/ pagination
	//   async getPostsByTopic(topic: string, skip = 0, take = 10): Promise<Post[]> {
	//     try {
	//       return await this.repo
	//         .createQueryBuilder('post')
	//         .where('topic = :topic', { topic })
	//         .orderBy('post.createdDate', 'DESC')
	//         .skip(skip)
	//         .take(take)
	//         .getMany();
	//     } catch (err) {
	//       throw err;
	//     }
	//   }

	// Get trending data
	// select topic
	// from "Post"
	// where "createdDate" > now() - interval '1 hour'

	//   Create a new post
	async createPost({ caption, image_url }: CreatePostInput, userId: string): Promise<Post> {
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
						// replies: [],
					}
				])
				.execute();
			const postId = insertResult.identifiers[0].id;
			const newPost = await this.findOne(postId);
			// Pass newly created post to profile
			await this.userService.savePostToUser(user.id, newPost);
			return newPost;
		} catch (err) {
			throw err;
		}
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

	//   reply to post
	//   async replyToPost(
	//     handle: string,
	//     text: string,
	//     postId: string,
	//   ): Promise<Post> {
	//     try {
	//       // Get post to reply to
	//       const post = await this.repo
	//         .createQueryBuilder('post')
	//         .leftJoinAndSelect('post.replies', 'reply')
	//         .where('post.id = :id', { id: postId })
	//         .getOne();
	//       // insert new reply and return reply id
	//       const result: InsertResult = await this.replyRepository
	//         .createQueryBuilder()
	//         .insert()
	//         .into(Reply)
	//         .values([{ handle, text, post }])
	//         .execute();
	//       // return new reply and add to post
	//       const reply = await this.replyRepository.findOne(result.identifiers[0]);
	//       post.replies = [...post.replies, reply];
	//       return await this.repo.save(post);
	//     } catch (err) {
	//       throw err;
	//     }
	//   }
}
