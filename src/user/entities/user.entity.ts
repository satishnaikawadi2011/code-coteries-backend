import { Field, ObjectType } from '@nestjs/graphql';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { Profile } from './profile.entity';

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
	@Column()
	is_active: boolean;

	@Field()
	@CreateDateColumn()
	created_at: Date;

	@Field()
	@UpdateDateColumn()
	updated_at: Date;

	@Field((type) => Profile)
	@OneToOne(() => Profile)
	@JoinColumn()
	profile: Profile;
}
