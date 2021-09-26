import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from 'src/event/entities/event.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Comment } from './comment';

@ObjectType()
@Entity({ name: 'event_comments' })
export class EventComment extends Comment {
	@Field((type) => User)
	@ManyToOne(() => User, (user) => user.event_comments)
	@JoinColumn()
	user: User;

	@Field((type) => Event)
	@ManyToOne(() => Event, (event) => event.comments)
	@JoinColumn()
	event: Event;
}
