import { DEFAULT_USER_AVATAR } from './../../constants/index';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { PostComment } from 'src/comment/entities/post-comment.entity';
import { Tag } from 'src/tag/entities/tag.entity';

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

	@Field((type) => String)
	@CreateDateColumn()
	created_at: Date;

	@Field((type) => String)
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

	@Field()
	@Column({ default: DEFAULT_USER_AVATAR })
	avatar_url: string;

	@Field() likeCount: number;

	@Field() commentCount: number;

	@Field(
		(type) => [
			Tag
		],
		{ nullable: true }
	)
	@ManyToMany(() => Tag, (tag) => tag.posts)
	tags: Tag[];
}
