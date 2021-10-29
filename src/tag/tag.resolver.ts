import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AdminAuthGuard } from 'src/guards/admin-auth.guard';
import { Tag } from './entities/tag.entity';
import { CreateTagInput } from './input/create-tag.input';
import { TagService } from './tag.service';

@Resolver((of) => Tag)
export class TagResolver {
	constructor(private tagService: TagService) {}

	@UseGuards(AdminAuthGuard)
	@Mutation((returns) => Tag)
	async createTag(@Args('createTagInput') createTagInput: CreateTagInput): Promise<Tag> {
		return this.tagService.createTag(createTagInput);
	}
}
