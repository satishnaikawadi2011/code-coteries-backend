import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from './profile.entity';

@ObjectType()
@Entity()
export class Education {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field()
	@Column()
	school: string;

	@Field()
	@Column()
	degree: string;

	@Field()
	@Column()
	from: Date;

	@Field({ nullable: true })
	@Column({ nullable: true })
	to: Date;

	@Field()
	@Column({ default: false })
	current: boolean;

	@Field()
	@Column()
	description: string;

	@Field()
	@Column()
	field: string;

	@Field((type) => Profile)
	@ManyToOne(() => Profile, (profile) => profile.education)
	profile: Profile;
}
