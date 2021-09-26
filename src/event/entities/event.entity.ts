import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';

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

	@Field((type) => [
		String
	])
	@Column({ type: 'simple-array' })
	likes: string[];

	@Field() likeCount: number;
}
