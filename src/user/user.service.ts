import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventComment } from 'src/comment/entities/event-comment.entity';
import { PostComment } from 'src/comment/entities/post-comment.entity';
import { Event } from 'src/event/entities/event.entity';
import { Post } from 'src/post/entities/post.entity';
import { Repository, getManager, FindOneOptions } from 'typeorm';
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

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	create({ email, password, username }: CreateUserInput) {
		const user = this.repo.create({ email, password, username });
		return this.repo.save(user);
	}

	findOne(id: string, options?: FindOneOptions<User>) {
		if (!id) return null;
		return this.repo.findOne(id, options);
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

	async save(user: User) {
		const savedUser = await this.repo.save(user);
		return savedUser;
	}

	async getConnections(user: User) {
		const u = await this.repo.findOne(user.id, {
			relations:
				[
					'connections'
				]
		});
		return u.connections;
	}

	async getFollowerCount(id: string) {
		const count = await this.runRawQuery(`SELECT COUNT(userId_1) FROM user_connections_user WHERE userId_2 = ?`, [
			id
		]);
		return count[0]['COUNT(userId_1)'];
	}

	async getFollowingCount(id: string) {
		const count = await this.runRawQuery(`SELECT COUNT(userId_2) FROM user_connections_user WHERE userId_1 = ?`, [
			id
		]);
		return count[0]['COUNT(userId_2)'];
	}

	async getFollowers(id: string) {
		const followers = await this.runRawQuery(
			`
			SELECT *
			FROM user u
			INNER JOIN user_connections_user c
			ON u.id = c.userId_1
			 AND c.userId_2 = ?		
		`,
			[
				id
			]
		);

		return followers;
	}

	async getFollowings(id: string) {
		const followings = await this.runRawQuery(
			`
			SELECT *
			FROM user u
			INNER JOIN user_connections_user c
			ON u.id = c.userId_2
			 AND c.userId_1 = ?		
		`,
			[
				id
			]
		);

		return followings;
	}

	async getMyProfile(id: string) {
		const user = await this.findOne(id, {
			relations:
				[
					'profile'
				]
		});
		return user.profile;
	}

	// Save new post to user
	async savePostToUser(id: string, post: Post): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(User, 'posts').of(id).add(post);
		} catch (err) {
			throw err;
		}
	}

	// Save new event to user
	async saveEventToUser(id: string, event: Event): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(User, 'events').of(id).add(event);
		} catch (err) {
			throw err;
		}
	}

	// Save new comment to user
	async saveEventCommToUser(id: string, comment: EventComment): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(User, 'event_comments').of(id).add(comment);
		} catch (err) {
			throw err;
		}
	}

	// Save new comment to user
	async savePostCommToUser(id: string, comment: PostComment): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(User, 'post_comments').of(id).add(comment);
		} catch (err) {
			throw err;
		}
	}
}
