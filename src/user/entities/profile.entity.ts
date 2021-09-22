import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Education } from './education.entity';
import { Experience } from './experience.entity';
import { Social } from './social.entity';

@ObjectType()
@Entity()
export class Profile {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	website: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	company: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	location: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	bio: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	github: string;

	@Field()
	@Column({ default: 'https://res.cloudinary.com/dg2zkumuc/image/upload/v1597862391/slcwy3gm2gv6i3tn6n7d.png' })
	image_url: string;

	@Field((type) => [
		Experience
	])
	@OneToMany(() => Experience, (experience) => experience.profile)
	experience: Experience[];

	@Field((type) => [
		Education
	])
	@OneToMany(() => Education, (education) => education.profile)
	education: Education[];

	@Field((type) => Social, { nullable: true })
	@OneToOne(() => Social)
	@JoinColumn()
	social: Social;
}
