import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from './profile.entity';

@ObjectType()
@Entity()
export class Experience {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field()
	@Column()
	title: string;

	@Field()
	@Column()
	company: string;

	@Field()
	@Column()
	location: string;

	@Field()
	@Column()
	from: Date;

	@Field()
	@Column()
	to: Date;

	@Field()
	@Column({ default: false })
	current: boolean;

	@Field()
	@Column()
	description: string;

	@Field((type) => Profile)
	@ManyToOne(() => Profile, (profile) => profile.experience)
	profile: Profile;
}
