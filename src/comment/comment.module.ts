import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { PostComment } from './entities/post-comment.entity';
import { EventComment } from './entities/event-comment.entity';
import { EventModule } from 'src/event/event.module';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports:
		[
			TypeOrmModule.forFeature([
				PostComment,
				EventComment
			]),
			EventModule,
			UserModule,
			PostModule,
			JwtModule.register({
				secret: 'thisismysecret',
				signOptions: { expiresIn: '7d' }
			})
		],
	providers:
		[
			CommentService,
			CommentResolver
		]
})
export class CommentModule {}
