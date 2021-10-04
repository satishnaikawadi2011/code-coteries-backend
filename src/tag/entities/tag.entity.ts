import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from 'src/event/entities/event.entity';
import { Post } from 'src/post/entities/post.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';

@ObjectType()
@Entity()
export class Tag {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field()
	@Column()
	name: string;

	@Field()
	@Column()
	description: string;

	@Field((type) => [
		String
	])
	@Column({ type: 'simple-array' })
	likes: string[];

	@Field()
	@CreateDateColumn()
	created_at: Date;

	@Field()
	@UpdateDateColumn()
	updated_at: Date;

	@Field(
		(type) => [
			Post
		],
		{ nullable: true }
	)
	@ManyToMany(() => Post, (post) => post.tags)
	@JoinTable()
	posts: Post[];

	@Field(
		(type) => [
			Event
		],
		{ nullable: true }
	)
	@ManyToMany(() => Event, (event) => event.tags)
	@JoinTable()
	events: Event[];

	@Field() likesCount: number;
}
