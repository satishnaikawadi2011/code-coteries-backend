import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagResolver } from './tag.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Tag } from './entities/tag.entity';

@Module({
	imports:
		[
			TypeOrmModule.forFeature([
				Tag
			]),
			JwtModule.register({
				secret: 'thisismysecret',
				signOptions: { expiresIn: '7d' }
			})
		],
	providers:
		[
			TagService,
			TagResolver
		]
})
export class TagModule {}
