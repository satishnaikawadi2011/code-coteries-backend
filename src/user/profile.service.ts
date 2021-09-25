import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, FindOneOptions } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { EditProfileInput } from './inputs/edit-profile.input';

@Injectable()
export class ProfileService {
	constructor(@InjectRepository(Profile) private repo: Repository<Profile>) {}

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	create(profileInput: EditProfileInput) {
		const profile = this.repo.create(profileInput);
		return this.repo.save(profile);
	}

	findOne(id: string, options?: FindOneOptions<Profile>) {
		if (!id) return null;
		return this.repo.findOne(id, options);
	}

	async update(id: string, attrs?: EditProfileInput) {
		const profile = await this.findOne(id);
		if (!profile) {
			throw new NotFoundException('profile not found!');
		}
		Object.assign(profile, attrs);
		return this.repo.save(profile);
	}

	async save(profile: Profile) {
		const savedProfile = await this.repo.save(profile);
		return savedProfile;
	}

	async getEducationItems(id: string) {
		const profile = await this.repo.findOne(id, {
			relations:
				[
					'education'
				]
		});
		return profile.education;
	}

	async getExperienceItems(id: string) {
		const profile = await this.repo.findOne(id, {
			relations:
				[
					'experience'
				]
		});
		return profile.experience;
	}

	async getSocials(id: string) {
		const profile = await this.repo.findOne(id, {
			relations:
				[
					'social'
				]
		});
		return profile.social;
	}
}
