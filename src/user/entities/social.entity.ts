import { Field, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Social {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	youtube: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	facebook: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	instagram: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	twitter: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	linkedin: string;
}
