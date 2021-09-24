import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, FindOneOptions, FindManyOptions } from 'typeorm';
import { Experience } from './entities/experience.entity';
import { AddExperienceInput } from './inputs/add-experience.input';
import { EditExperienceInput } from './inputs/edit-experience.input';

@Injectable()
export class ExperienceService {
	constructor(@InjectRepository(Experience) private repo: Repository<Experience>) {}

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	create(addExperienceInput: AddExperienceInput) {
		const experience = this.repo.create({
			...addExperienceInput,
			to:

					addExperienceInput.to ? new Date(addExperienceInput.to) :
					null,
			from: new Date(addExperienceInput.from)
		});
		return this.repo.save(experience);
	}

	findOne(id: string, options?: FindOneOptions<Experience>) {
		if (!id) return null;
		return this.repo.findOne(id, options);
	}

	find(options?: FindManyOptions<Experience>) {
		return this.repo.find(options);
	}

	async update(id: string, attrs?: EditExperienceInput) {
		const experience = await this.findOne(id);
		if (!experience) {
			throw new NotFoundException('Experience item not found!');
		}
		Object.assign(experience, {
			...attrs,
			to:

					attrs.to ? new Date(attrs.to) :
					experience.to,
			from:

					attrs.from ? new Date(attrs.from) :
					experience.from
		});
		return this.repo.save(experience);
	}

	async save(experience: Experience) {
		const savedExperience = await this.repo.save(experience);
		return savedExperience;
	}

	async remove(id: string) {
		const exp = await this.findOne(id);
		if (!exp) {
			throw new NotFoundException('Experience not found!');
		}
		await this.repo.remove(exp);
		return;
	}

	async isMyExperience(profileId: string, id: string): Promise<boolean> {
		const isMyExp = await this.runRawQuery(
			`
			SELECT * FROM experience
			WHERE id = ?
			AND profileId = ?	
		`,
			[
				id,
				profileId
			]
		);
		return isMyExp.length !== 0;
	}
}
