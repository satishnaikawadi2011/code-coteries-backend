import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { EventComment } from 'src/comment/entities/event-comment.entity';

@ObjectType()
@Entity()
export class Event {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field()
	@Column()
	title: string;

	@Field()
	@Column()
	description: string;

	@Field()
	@Column()
	image_url: string;

	@Field()
	@Column({ unique: true })
	event_url: string;

	@Field()
	@CreateDateColumn()
	created_at: Date;

	@Field()
	@Column({ type: 'datetime' })
	event_date: string;

	@Field()
	@UpdateDateColumn()
	updated_at: Date;

	@Field((type) => User)
	@ManyToOne(() => User, (user) => user.events)
	@JoinColumn()
	user: User;

	@Field(
		(type) => [
			EventComment
		],
		{ nullable: true }
	)
	@OneToMany(() => EventComment, (comment) => comment.event)
	@JoinColumn()
	comments: EventComment[];

	@Field((type) => [
		String
	])
	@Column({ type: 'simple-array' })
	likes: string[];

	@Field() likeCount: number;
}
