import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '../../post/entities/post.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { Profile } from './profile.entity';
import { Event } from 'src/event/entities/event.entity';

@ObjectType()
@Entity()
export class User {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field()
	@Column({ unique: true })
	username: string;

	@Field()
	@Column()
	email: string;

	// @Field()
	@Column() password: string;

	@Field()
	@Column({ default: false })
	is_active: boolean;

	@Field()
	@CreateDateColumn()
	created_at: Date;

	@Field()
	@UpdateDateColumn()
	updated_at: Date;

	@Field((type) => Profile, { nullable: true })
	@OneToOne(() => Profile)
	@JoinColumn()
	profile: Profile;

	@Field(
		(type) => [
			User
		],
		{ nullable: true }
	)
	@ManyToMany(() => User, (user) => user.connections)
	@JoinTable()
	connections: User[];

	@Field(
		(type) => [
			Event
		],
		{ nullable: true }
	)
	@OneToMany(() => Event, (event) => event.user)
	events: Event[];

	@Field(
		(type) => [
			Post
		],
		{ nullable: true }
	)
	@OneToMany(() => Post, (post) => post.user)
	posts: Post[];

	@Field() followingCount: number;

	@Field() followerCount: number;
}
