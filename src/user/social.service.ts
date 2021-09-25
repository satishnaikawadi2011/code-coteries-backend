import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, FindOneOptions } from 'typeorm';
import { Social } from './entities/social.entity';
import { EditSocialInput } from './inputs/edit-social.input';

@Injectable()
export class SocialService {
	constructor(@InjectRepository(Social) private repo: Repository<Social>) {}

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	create(editSocialInput: EditSocialInput) {
		const social = this.repo.create(editSocialInput);
		return this.repo.save(social);
	}

	findOne(id: string, options?: FindOneOptions<Social>) {
		if (!id) return null;
		return this.repo.findOne(id, options);
	}

	async update(id: string, attrs?: EditSocialInput) {
		const social = await this.findOne(id);
		if (!social) {
			throw new NotFoundException('social not found!');
		}
		Object.assign(social, attrs);
		return this.repo.save(social);
	}

	async remove(id: string) {
		const social = await this.findOne(id);
		if (!social) {
			throw new NotFoundException('User not found!');
		}
		await this.repo.remove(social);
		Object.assign(social, { id });
		return social;
	}

	async save(social: Social) {
		const savedSocial = await this.repo.save(social);
		return savedSocial;
	}
}
