import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TagModule } from 'src/tag/tag.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
	imports:
		[
			TypeOrmModule.forFeature([
				Post
			]),
			UserModule,
			TagModule,
			forwardRef(() => CommentModule),
			JwtModule.register({
				secret: 'thisismysecret',
				signOptions: { expiresIn: '7d' }
			})
		],
	providers:
		[
			PostService,
			PostResolver
		],
	exports:
		[
			PostService
		]
})
export class PostModule {}
