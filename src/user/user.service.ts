import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';

interface FindAttrs {
	email: string;
	username: string;
}
@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	create({ email, password, username }: CreateUserInput) {
		const user = this.repo.create({ email, password, username });
		return this.repo.save(user);
	}

	findOne(id: string) {
		if (!id) return null;
		return this.repo.findOne(id);
	}

	find(attrs: Partial<FindAttrs>) {
		return this.repo.find(attrs);
	}

	findByEmailOrUsername(email: string, username: string) {
		return this.repo.find({
			where:
				[
					{ email },
					{ username }
				]
		});
	}

	async update(id: string, attrs?: UpdateUserInput) {
		const user = await this.findOne(id);
		if (!user) {
			throw new NotFoundException('user not found!');
		}
		Object.assign(user, attrs);
		return this.repo.save(user);
	}

	async remove(id: string) {
		const user = await this.findOne(id);
		if (!user) {
			throw new NotFoundException('User not found!');
		}
		await this.repo.remove(user);
		Object.assign(user, { id });
		return user;
	}
}
