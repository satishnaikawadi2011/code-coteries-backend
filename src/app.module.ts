import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Education } from './user/entities/education.entity';
import { Experience } from './user/entities/experience.entity';
import { Profile } from './user/entities/profile.entity';
import { Social } from './user/entities/social.entity';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { Post } from './post/entities/post.entity';
import { EventModule } from './event/event.module';
import { Event } from './event/entities/event.entity';
import { CommentModule } from './comment/comment.module';
import { PostComment } from './comment/entities/post-comment.entity';
import { EventComment } from './comment/entities/event-comment.entity';
import { TagModule } from './tag/tag.module';

@Module({
	imports:
		[
			GraphQLModule.forRoot({
				autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
				context:
					async ({ req, connection }) => {
						// subscriptions
						if (connection) {
							return { headers: connection.context };
						}
						// queries and mutations
						return { headers: req.headers };
					},
				installSubscriptionHandlers: true
			}),
			TypeOrmModule.forRoot({
				type: 'sqlite',
				database: 'db.sqlite',
				entities:
					[
						User,
						Social,
						Experience,
						Education,
						Profile,
						Post,
						Event,
						PostComment,
						EventComment
					],
				synchronize: true
			}),
			UserModule,
			PostModule,
			EventModule,
			CommentModule,
			TagModule
		],
	controllers:
		[
			AppController
		],
	providers:
		[
			AppService
		]
})
export class AppModule {}
