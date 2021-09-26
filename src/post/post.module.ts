import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports:
		[
			TypeOrmModule.forFeature([
				Post
			]),
			UserModule,
			JwtModule.register({
				secret: 'thisismysecret',
				signOptions: { expiresIn: '7d' }
			})
		],
	providers:
		[
			PostService,
			PostResolver
		]
})
export class PostModule {}
