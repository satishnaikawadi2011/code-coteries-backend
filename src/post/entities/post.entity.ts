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
import { PostComment } from 'src/comment/entities/post-comment.entity';

@ObjectType()
@Entity()
export class Post {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field()
	@Column()
	caption: string;

	@Field()
	@Column()
	image_url: string;

	@Field()
	@CreateDateColumn()
	created_at: Date;

	@Field()
	@UpdateDateColumn()
	updated_at: Date;

	@Field((type) => User)
	@ManyToOne(() => User, (user) => user.posts)
	@JoinColumn()
	user: User;

	@Field(
		(type) => [
			PostComment
		],
		{ nullable: true }
	)
	@OneToMany(() => PostComment, (comment) => comment.post)
	@JoinColumn()
	comments: PostComment[];

	@Field((type) => [
		String
	])
	@Column({ type: 'simple-array' })
	likes: string[];

	@Field()
	@Column()
	handle: string;

	@Field() likeCount: number;

	// @Field(
	// 	(type) => [
	// 		User
	// 	],
	// 	{ nullable: true }
	// )
	// @ManyToMany(() => User, (user) => user.connections)
	// @JoinTable()
	// connections: User[];
}
