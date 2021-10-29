import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagResolver } from './tag.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Tag } from './entities/tag.entity';
import { UserModule } from 'src/user/user.module';

@Module({
	imports:
		[
			TypeOrmModule.forFeature([
				Tag
			]),
			UserModule,
			JwtModule.register({
				secret: 'thisismysecret',
				signOptions: { expiresIn: '7d' }
			})
		],
	providers:
		[
			TagService,
			TagResolver
		],
	exports:
		[
			TagService
		]
})
export class TagModule {}
