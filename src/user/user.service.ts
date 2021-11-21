import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventComment } from 'src/comment/entities/event-comment.entity';
import { PostComment } from 'src/comment/entities/post-comment.entity';
import { Event } from 'src/event/entities/event.entity';
import { Post } from 'src/post/entities/post.entity';
import { Repository, getManager, FindOneOptions, In, MoreThan, Like } from 'typeorm';
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

	create({ email, password, username, fullName }: CreateUserInput) {
		const user = this.repo.create({ email, password, username, fullName, saved_posts: [] });
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

	async getSuggestedUsers(followerIds: string[], created_at: string, limit = 10) {
		const users = await this.repo.find({
			where:
				[
					{ id: In(followerIds) },
					{ created_at: MoreThan(created_at) }
				],
			take: limit
		});

		return users;
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

	// remove post from user
	async removePostFromUser(id: string, post: Post): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(User, 'posts').of(id).remove(post);
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

	// remove event from user
	async removeEventFromUser(id: string, event: Event): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(User, 'events').of(id).remove(event);
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

	// search users with given query by name or username
	async searchUsers(query: string, limit?: number): Promise<User[]> {
		try {
			const users = await this.repo.find({
				where:
					[
						{ username: Like(`%${query}%`) },
						{ fullName: Like(`%${query}%`) }
					],
				take:

						limit ? limit :
						10
			});
			return users;
		} catch (err) {
			throw err;
		}
	}

	async addPostToBookmark(postId: string, userId: string) {
		const user = await this.repo.findOne(userId);
		user.saved_posts = [
			postId,
			...user.saved_posts
		];
		await this.repo.save(user);
		return postId;
	}

	async removePostFromBookmark(postId: string, userId: string) {
		const user = await this.repo.findOne(userId);
		user.saved_posts = user.saved_posts.filter((pid) => pid !== postId);
		await this.repo.save(user);
		return postId;
	}
}
