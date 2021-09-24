import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Social } from './entities/social.entity';
import { Experience } from './entities/experience.entity';
import { Education } from './entities/education.entity';
import { Profile } from './entities/profile.entity';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { EducationService } from './education.service';
import { ProfileResolver } from './profile.resolver';
import { ExperienceService } from './experience.service';

@Module({
	imports:
		[
			TypeOrmModule.forFeature([
				User,
				Social,
				Experience,
				Education,
				Profile
			]),
			JwtModule.register({
				secret: 'thisismysecret',
				signOptions: { expiresIn: '7d' }
			})
		],
	providers:
		[
			UserService,
			UserResolver,
			AuthService,
			ProfileService,
			EducationService,
			ExperienceService,
			ProfileResolver
		],
	exports:
		[
			UserService
		]
})
export class UserModule {}
