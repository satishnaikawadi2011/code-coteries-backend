import { Event } from './entities/event.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, getManager, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { AddEventInput } from './input/add-event.input';
import { EventComment } from 'src/comment/entities/event-comment.entity';
import { TagService } from 'src/tag/tag.service';
import { Tag } from 'src/tag/entities/tag.entity';

@Injectable()
export class EventService {
	constructor(
		@InjectRepository(Event) private repo: Repository<Event>,
		private userService: UserService,
		private tagService: TagService
	) {}

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

	async getAllEvents(skip = 0, take = 10): Promise<Event[]> {
		try {
			return await this.repo
				.createQueryBuilder('event')
				.leftJoinAndSelect('event.comments', 'comments')
				.orderBy('event.event_date', 'ASC')
				.skip(skip)
				.take(take)
				.getMany();
		} catch (err) {
			throw err;
		}
	}

	//   Get post by postId
	async getEventById(id: string): Promise<Event> {
		try {
			const event = await this.repo
				.createQueryBuilder('event')
				.leftJoinAndSelect('event.comments', 'comments')
				.where('event.id = :id', { id })
				.getOne();
			return event;
		} catch (err) {
			throw err;
		}
	}

	//   Create a new post
	async createEvent(
		{ description, event_date, event_url, image_url, title, tagIds }: AddEventInput,
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

			const user = await this.userService.findOne(userId,{relations:['profile']});
			const insertResult = await this.repo
				.createQueryBuilder()
				.insert()
				.into(Event)
				.values([
					{
						likes: [],
						user,
						handle: user.username,
						avatar_url:user.profile?.image_url,
						image_url,
						description,
						event_url,
						event_date,
						title
					}
				])
				.execute();
			const eventId = insertResult.identifiers[0].id;
			const newEvent = await this.findOne(eventId);

			// if user has attached some tags to the event
			if (tagIds && tagIds.length !== 0) {
				const tags = await this.tagService.find({ where: { id: In(tagIds) } });
				tags.forEach(async (tag) => {
					await this.saveTagToEvent(eventId, tag);
				});
			}

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

	// all events related to particular tag
	async getAllEventsRelatedToTag(tagId: string) {
		const events = await this.runRawQuery(
			`
			SELECT * FROM event e
			INNER JOIN tag_events_event te
			ON te.tagId = ? AND te.eventId = e.id
		`,
			[
				tagId
			]
		);
		return events;
	}

	async getTagsOfEvent(eventId: string) {
		const event = await this.findOne(eventId, {
			relations:
				[
					'tags'
				]
		});
		return event.tags;
	}

	// add tag to event
	async saveTagToEvent(id: string, tag: Tag): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(Event, 'tags').of(id).add(tag);
		} catch (err) {
			throw err;
		}
	}
}
