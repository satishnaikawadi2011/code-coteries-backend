import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventService } from 'src/event/event.service';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';
import { CommentType } from 'src/utils/types';
import { FindManyOptions, FindOneOptions, getManager, LessThan, Repository } from 'typeorm';
import { EventComment } from './entities/event-comment.entity';
import { PostComment } from './entities/post-comment.entity';
import { AddCommentInput } from './input/add-comment';
import { CommentResponse } from './types/comment-res';

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
			return this.eventCommRepo.findOne(id, options?.ecOpts);
		}
		else {
			return this.postCommRepo.findOne(id, options?.pcOpts);
		}
	}

	find(
		type: CommentType,
		options?: { pcOpts?: FindManyOptions<PostComment>; ecOpts?: FindManyOptions<EventComment> }
	) {
		if (type == 'EventComment') {
			return this.eventCommRepo.find(options?.ecOpts);
		}
		else {
			return this.postCommRepo.find(options?.pcOpts);
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
	//   Create a new post
	async createComment({ commentType, content, entityId }: AddCommentInput, userId: string): Promise<CommentResponse> {
		let res: CommentResponse;
		try {
			// Find user by id
			const user = await this.userService.findOne(userId);
			let newComment;
			if (commentType == 'EventComment') {
				const event = await this.eventService.findOne(entityId);
				if (!event) {
					throw new NotFoundException('Event with this id does not exists !');
				}
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
				res = { eventComment: newComment, postComment: null };
			}
			else {
				const post = await this.postService.findOne(entityId);
				if (!post) {
					throw new NotFoundException('Post with this id does not exists !');
				}
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
				res = { eventComment: null, postComment: newComment };
			}
			return res;
		} catch (err) {
			throw err;
		}
	}

	//   like/dislike event
	async likeComment(commentId: string, userId: string, type: CommentType): Promise<CommentResponse> {
		try {
			let res: CommentResponse = { eventComment: null, postComment: null };
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
				const comm = await this.eventCommRepo.save(comment);
				res = { ...res, eventComment: comm };
			}
			else {
				const comm = await this.postCommRepo.save(comment);
				res = { ...res, postComment: comm };
			}
			return res;
		} catch (err) {
			throw err;
		}
	}



	
	//   get comments of particular post
	async getCommentsOfPost(postId: string, limit?:number,lastTimestamp?: string,skip?:number): Promise<PostComment[]> {
		try {
			const l = limit ? limit : 10;
			let c = [];
			if (lastTimestamp) {
			 c = await this.runRawQuery(`
			SELECT * FROM post_comments
			WHERE postId = ? AND created_at < ?
			ORDER BY created_at DESC
			LIMIT ?
			`,[postId,lastTimestamp,l])
			} else {
				 c = await this.runRawQuery(`
			SELECT * FROM post_comments
			WHERE postId = ?
			ORDER BY created_at DESC
			LIMIT ?
			`,[postId,l])
			}
			
			return c.map(com => {
				return {
					...com,
					likes: com.likes === '' ? [] : com.likes.split(',')
				}
			});
		} catch (err) {
			throw err;
		}
	}

	//   get comment count of particular post
	async getCommentCountOfPost(postId: string): Promise<number> {
		try {
			const count = await this.postCommRepo.count({
				where:
					{
						post:
							{
								id: postId
							}
					}
			});
			return count;
		} catch (err) {
			throw err;
		}
	}

	async getUserOfComment(handle: string) {
		const user = await this.runRawQuery(`
		SELECT * FROM user
		WHERE username = ?
		`,[handle])
		// console.log(user);
		return user[0];
	}
}
