import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Context, ResolveField, Mutation, Parent } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Event } from './entities/event.entity';
import { EventService } from './event.service';
import { AddEventInput } from './input/add-event.input';

@Resolver((of) => Event)
export class EventResolver {
	constructor(private userService: UserService, private eventService: EventService) {}

	@UseGuards(AuthGuard)
	@Query((returns) => Event)
	async getEvent(@Args('eventId') eventId: string): Promise<Event> {
		return this.eventService.getEventById(eventId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Event)
	async createEvent(
		@Args('addEventInput') addEventInput: AddEventInput,
		@Context('userId') userId: string
	): Promise<Event> {
		return this.eventService.createEvent(addEventInput, userId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Event)
	async likeEvent(@Args('eventId') eventId: string, @Context('userId') userId: string): Promise<Event> {
		return this.eventService.likeEvent(eventId, userId);
	}

	@ResolveField((returns) => User)
	async user(@Parent() event: Event): Promise<User> {
		return this.eventService.getEventOwner(event);
	}

	@ResolveField((returns) => User)
	async likeCount(@Parent() event: Event): Promise<number> {
		return event.likes.length;
	}
}
