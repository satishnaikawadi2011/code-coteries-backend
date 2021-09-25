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
						Profile
					],
				synchronize: true
			}),
			UserModule,
			PostModule
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
