import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, FindOneOptions, FindManyOptions } from 'typeorm';
import { Education } from './entities/education.entity';
import { AddEducationInput } from './inputs/add-education.input';
import { EditEducationInput } from './inputs/edit-education.input';

@Injectable()
export class EducationService {
	constructor(@InjectRepository(Education) private repo: Repository<Education>) {}

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	create(addEducationInput: AddEducationInput) {
		const education = this.repo.create({
			...addEducationInput,
			to:

					addEducationInput.to ? new Date(addEducationInput.to) :
					null,
			from: new Date(addEducationInput.from)
		});
		return this.repo.save(education);
	}

	findOne(id: string, options?: FindOneOptions<Education>) {
		if (!id) return null;
		return this.repo.findOne(id, options);
	}

	find(options?: FindManyOptions<Education>) {
		return this.repo.find(options);
	}

	async update(id: string, attrs?: EditEducationInput) {
		const education = await this.findOne(id);
		if (!education) {
			throw new NotFoundException('Education item not found!');
		}
		Object.assign(education, {
			...attrs,
			to:

					attrs.to ? new Date(attrs.to) :
					education.to,
			from:

					attrs.from ? new Date(attrs.from) :
					education.from
		});
		return this.repo.save(education);
	}

	async save(education: Education) {
		const savedEducation = await this.repo.save(education);
		return savedEducation;
	}

	async remove(id: string) {
		const edu = await this.findOne(id);
		if (!edu) {
			throw new NotFoundException('Education not found!');
		}
		await this.repo.remove(edu);
		return;
	}

	async isMyEducation(profileId: string, id: string): Promise<boolean> {
		const isMyEd = await this.runRawQuery(
			`
			SELECT * FROM education
			WHERE id = ?
			AND profileId = ?	
		`,
			[
				id,
				profileId
			]
		);
		return isMyEd.length !== 0;
	}
}
