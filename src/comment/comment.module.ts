import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { PostComment } from './entities/post-comment.entity';
import { EventComment } from './entities/event-comment.entity';

@Module({
	imports:
		[
			TypeOrmModule.forFeature([
				PostComment,
				EventComment
			])
		],
	providers:
		[
			CommentService,
			CommentResolver
		]
})
export class CommentModule {}
