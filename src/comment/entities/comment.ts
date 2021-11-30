import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
export abstract class Comment {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field()
	@Column()
	content: string;

	@Field()
	@Column()
	handle: string;

	@Field((type) => String)
	@CreateDateColumn()
	created_at: Date;

	@Field((type) => String)
	@UpdateDateColumn()
	updated_at: Date;

	@Field((type) => [
		String
	])
	@Column({ type: 'simple-array' })
	likes: string[];
}
