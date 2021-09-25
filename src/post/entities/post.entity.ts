import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
	user: User;

	// @Field(
	// 	(type) => [
	// 		User
	// 	],
	// 	{ nullable: true }
	// )
	// @ManyToMany(() => User, (user) => user.connections)
	// @JoinTable()
	// connections: User[];

	// @Field() followingCount: number;

	// @Field() followerCount: number;
}
