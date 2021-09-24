import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { EducationService } from './education.service';
import { Education } from './entities/education.entity';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';

@Resolver((of) => Profile)
export class ProfileResolver {
	constructor(
		private usersService: UserService,
		private profileService: ProfileService,
		private educationService: EducationService
	) {}

	@ResolveField((returns) => [
		Education
	])
	education(@Parent() profile: Profile): Promise<Education[]> {
		return this.profileService.getEducationItems(profile.id);
	}
}
