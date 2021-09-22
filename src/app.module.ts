import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

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
						User
					],
				synchronize: true
			}),
			UserModule
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
