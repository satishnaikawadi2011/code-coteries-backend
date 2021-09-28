import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventService } from 'src/event/event.service';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';
import { CommentType } from 'src/utils/types';
import { FindManyOptions, FindOneOptions, getManager, Repository } from 'typeorm';
import { EventComment } from './entities/event-comment.entity';
import { PostComment } from './entities/post-comment.entity';
import { AddCommentInput } from './input/add-comment';

@Injectable()
export class CommentService {
	constructor(
		@InjectRepository(PostComment) private postCommRepo: Repository<PostComment>,
		@InjectRepository(PostComment) private eventCommRepo: Repository<EventComment>,
		private userService: UserService,
		private postService: PostService,
		private eventService: EventService
	) {}

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	async create(content: string, type: CommentType) {
		if (type == 'EventComment') {
			const comm = await this.eventCommRepo.create({ content });
			return this.eventCommRepo.save(comm);
		}
		else {
			const comm = await this.postCommRepo.create({ content });
			return this.postCommRepo.save(comm);
		}
	}

	findOne(
		id: string,
		type: CommentType,
		options?: { pcOpts?: FindOneOptions<PostComment>; ecOpts?: FindOneOptions<EventComment> }
	) {
		if (!id) return null;
		if (type == 'EventComment') {
			return this.eventCommRepo.findOne(id, options.ecOpts);
		}
		else {
			return this.postCommRepo.findOne(id, options.pcOpts);
		}
	}

	find(
		type: CommentType,
		options?: { pcOpts?: FindManyOptions<PostComment>; ecOpts?: FindManyOptions<EventComment> }
	) {
		if (type == 'EventComment') {
			return this.eventCommRepo.find(options.ecOpts);
		}
		else {
			return this.postCommRepo.find(options.pcOpts);
		}
	}

	async remove(id: string, type: CommentType) {
		const comm = await this.findOne(id, type);
		if (!comm) {
			throw new NotFoundException('Comment not found!');
		}
		if (type == 'EventComment') {
			await this.eventCommRepo.remove(comm as any);
		}
		else {
			await this.postCommRepo.remove(comm as any);
		}
		return;
	}

	async save(comment: EventComment | PostComment, type: CommentType) {
		let savedComm;
		if (type == 'EventComment') {
			savedComm = await this.eventCommRepo.save(comment);
		}
		else {
			await this.postCommRepo.save(comment);
		}
		return savedComm;
	}

	//     async getAllPosts(skip = 0, take = 10): Promise<Post[]> {
	//     try {
	//       return await this.repo
	//         .createQueryBuilder('post')
	//         .leftJoinAndSelect('post.replies', 'replies')
	//         .orderBy('post.createdDate', 'DESC')
	//         .skip(skip)
	//         .take(take)
	//         .getMany();
	//     } catch (err) {
	//       throw err;
	//     }
	//   }

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
	async createComment(
		{ commentType, content, entityId }: AddCommentInput,
		userId: string
	): Promise<EventComment | PostComment> {
		try {
			// Find user by id
			const user = await this.userService.findOne(userId);
			let newComment;
			if (commentType == 'EventComment') {
				const insertResult = await this.eventCommRepo
					.createQueryBuilder()
					.insert()
					.into(EventComment)
					.values([
						{
							likes: [],
							user,
							content,
							handle: user.username
						}
					])
					.execute();
				const commentId = insertResult.identifiers[0].id;
				newComment = await this.findOne(commentId, commentType);
				// Pass newly created comment to user
				await this.userService.saveEventCommToUser(user.id, newComment);
				// Pass newly created comment to event
				await this.eventService.saveCommentToEvent(entityId, newComment);
			}
			else {
				const insertResult = await this.postCommRepo
					.createQueryBuilder()
					.insert()
					.into(PostComment)
					.values([
						{
							likes: [],
							user,
							content,
							handle: user.username
						}
					])
					.execute();
				const commentId = insertResult.identifiers[0].id;
				newComment = await this.findOne(commentId, commentType);
				// Pass newly created comment to user
				await this.userService.savePostCommToUser(user.id, newComment);
				// Pass newly created comment to post
				await this.postService.saveCommentToPost(entityId, newComment);
			}
			return newComment;
		} catch (err) {
			throw err;
		}
	}

	//   like/dislike event
	async likeComment(commentId: string, userId: string, type: CommentType): Promise<EventComment | PostComment> {
		try {
			const comment = await this.findOne(commentId, type);
			// check if userId has already liked comment
			if (comment.likes.some((like) => like === userId)) {
				// unlike
				comment.likes.splice(comment.likes.indexOf(userId), 1);
			}
			else {
				comment.likes.push(userId);
			}

			if (type == 'EventComment') {
				return await this.eventCommRepo.save(comment);
			}
			else {
				return await this.postCommRepo.save(comment);
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
