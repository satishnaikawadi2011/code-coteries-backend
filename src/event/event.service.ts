import { Event } from './entities/event.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, getManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { AddEventInput } from './input/add-event.input';
import { EventComment } from 'src/comment/entities/event-comment.entity';

@Injectable()
export class EventService {
	constructor(@InjectRepository(Event) private repo: Repository<Event>, private userService: UserService) {}

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	create(addEventInput: AddEventInput) {
		const event = this.repo.create(addEventInput);
		return this.repo.save(event);
	}

	findOne(id: string, options?: FindOneOptions<Event>) {
		if (!id) return null;
		return this.repo.findOne(id, options);
	}

	find(options?: FindManyOptions<Event>) {
		return this.repo.find(options);
	}

	async remove(id: string) {
		const event = await this.findOne(id);
		if (!event) {
			throw new NotFoundException('Event not found!');
		}
		await this.repo.remove(event);
		return;
	}

	async save(event: Event) {
		const savedEvent = await this.repo.save(event);
		return savedEvent;
	}

	async getEventOwner(event: Event) {
		const user = await (await this.findOne(event.id, {
			relations:
				[
					'user'
				]
		})).user;
		return user;
	}

	// Save new comment to event
	async saveCommentToEvent(id: string, comment: EventComment): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(Event, 'comments').of(id).add(comment);
		} catch (err) {
			throw err;
		}
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

	//   Get post by postId
	async getEventById(id: string): Promise<Event> {
		try {
			const event = await this.repo
				.createQueryBuilder('event')
				// .leftJoinAndSelect('post.replies', 'reply')
				.where('event.id = :id', { id })
				.getOne();
			return event;
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
	async createEvent(
		{ description, event_date, event_url, image_url, title }: AddEventInput,
		userId: string
	): Promise<Event> {
		try {
			// Find user by id
			if (Date.now() > new Date(event_date).getTime()) {
				throw new BadRequestException('Event date must not be in the past !!!');
			}

			const isExists = await this.find({ where: { event_url } });
			if (isExists.length !== 0) {
				throw new BadRequestException('Event with this event_url already exists !!');
			}

			const user = await this.userService.findOne(userId);
			const insertResult = await this.repo
				.createQueryBuilder()
				.insert()
				.into(Event)
				.values([
					{
						likes: [],
						user,
						image_url,
						description,
						event_url,
						event_date,
						title
						// replies: [],
					}
				])
				.execute();
			const eventId = insertResult.identifiers[0].id;
			const newEvent = await this.findOne(eventId);
			// Pass newly created event to user
			await this.userService.saveEventToUser(user.id, newEvent);
			return newEvent;
		} catch (err) {
			throw err;
		}
	}

	//   like/dislike event
	async likeEvent(eventId: string, userId: string): Promise<Event> {
		try {
			const event = await this.findOne(eventId);
			// check if userId has already liked event
			if (event.likes.some((like) => like === userId)) {
				// unlike
				event.likes.splice(event.likes.indexOf(userId), 1);
				return await this.repo.save(event);
			}
			else {
				event.likes.push(userId);
				return await this.repo.save(event);
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
