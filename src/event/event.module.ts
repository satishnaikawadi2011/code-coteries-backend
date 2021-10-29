import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventResolver } from './event.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { JwtModule } from '@nestjs/jwt';
import { TagModule } from 'src/tag/tag.module';

@Module({
	imports:
		[
			TypeOrmModule.forFeature([
				Event
			]),
			UserModule,
			TagModule,
			JwtModule.register({
				secret: 'thisismysecret',
				signOptions: { expiresIn: '7d' }
			})
		],
	providers:
		[
			EventService,
			EventResolver
		],
	exports:
		[
			EventService
		]
})
export class EventModule {}
