import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { sortTags } from 'src/utils/sort';
import { FindManyOptions, FindOneOptions, getManager, Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagInput } from './input/create-tag.input';

@Injectable()
export class TagService {
	constructor(@InjectRepository(Tag) private repo: Repository<Tag>) {}

	async runRawQuery(query: string, parameters?: any[]) {
		const manager = await getManager();
		return manager.query(query, parameters);
	}

	create(createTagInput: CreateTagInput) {
		const tag = this.repo.create(createTagInput);
		return this.repo.save(tag);
	}

	findOne(id: string, options?: FindOneOptions<Tag>) {
		if (!id) return null;
		return this.repo.findOne(id, options);
	}

	find(options?: FindManyOptions<Tag>) {
		return this.repo.find(options);
	}

	async remove(id: string) {
		const tag = await this.findOne(id);
		if (!tag) {
			throw new NotFoundException('Tag not found!');
		}
		await this.repo.remove(tag);
		return;
	}

	async save(tag: Tag) {
		const savedTag = await this.repo.save(tag);
		return savedTag;
	}

	async getAllTags(skip = 0, take = 10): Promise<Tag[]> {
		try {
			const tags = await this.repo.createQueryBuilder('tag').skip(skip).take(take).getMany();
			const sortedTags = sortTags(tags);
			return sortedTags;
		} catch (err) {
			throw err;
		}
	}

	//   like/dislike tag
	async likeTag(tagId: string, userId: string): Promise<Tag> {
		try {
			const tag = await this.findOne(tagId);
			// check if userId has already liked tag
			if (tag.likes.some((like) => like === userId)) {
				// unlike
				tag.likes.splice(tag.likes.indexOf(userId), 1);
				return await this.repo.save(tag);
			}
			else {
				tag.likes.push(userId);
				return await this.repo.save(tag);
			}
		} catch (err) {
			throw err;
		}
	}

	//   Create a new tag
	async createTag({ description, name }: CreateTagInput): Promise<Tag> {
		try {
			// Find tags by name
			const isExists = await this.find({ where: { name } });
			if (isExists.length) {
				throw new BadRequestException('Tag with this name already exists !!');
			}
			const insertResult = await this.repo
				.createQueryBuilder()
				.insert()
				.into(Tag)
				.values([
					{
						description,
						likes: [],
						name
					}
				])
				.execute();
			const tagId = insertResult.identifiers[0].id;
			const newTag = await this.findOne(tagId);
			return newTag;
		} catch (err) {
			throw err;
		}
	}

	// add post to tag
	async savePostToTag(id: string, post: Post): Promise<void> {
		try {
			await this.repo.createQueryBuilder().relation(Tag, 'posts').of(id).add(post);
		} catch (err) {
			throw err;
		}
	}
}
