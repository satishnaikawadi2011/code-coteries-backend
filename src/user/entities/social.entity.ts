import { Field, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Social {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field()
	@Column()
	youtube: string;

	@Field()
	@Column()
	facebook: string;

	@Field()
	@Column()
	instagram: string;

	@Field()
	@Column()
	twitter: string;

	@Field()
	@Column()
	linkedin: string;
}
