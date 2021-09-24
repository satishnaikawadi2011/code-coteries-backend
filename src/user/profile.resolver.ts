import { AuthGuard } from './../guards/auth.guard';
import { BadGatewayException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { EducationService } from './education.service';
import { Education } from './entities/education.entity';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';
import { EditEducationInput } from './inputs/edit-education.input';

@Resolver((of) => Profile)
export class ProfileResolver {
	constructor(
		private usersService: UserService,
		private profileService: ProfileService,
		private educationService: EducationService
	) {}

	@Mutation((returns) => Education)
	@UseGuards(AuthGuard)
	async editEducation(
		@Args('id') id: string,
		@Args('editEducationInput') editEducationInput: EditEducationInput,
		@Context('userId') userId: string
	): Promise<Education> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile',
					'profile.education'
				]
		});
		if (!user.profile || !user.profile.education) {
			throw new BadGatewayException('You are not allowed to edit this education !');
		}
		else {
			const isMyEd = await this.educationService.isMyEducation(user.profile.id, id);
			if (!isMyEd) {
				throw new BadGatewayException('You are not allowed to edit this education !');
			}
		}
		const updatedEd = await this.educationService.update(id, editEducationInput);
		return updatedEd;
	}

	@Mutation((returns) => String)
	@UseGuards(AuthGuard)
	async removeEducation(@Args('id') id: string, @Context('userId') userId: string): Promise<string> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile',
					'profile.education'
				]
		});
		if (!user.profile || !user.profile.education) {
			throw new BadGatewayException('You are not allowed to remove this education !');
		}
		else {
			const isMyEd = await this.educationService.isMyEducation(user.profile.id, id);
			if (!isMyEd) {
				throw new BadGatewayException('You are not allowed to remove this education !');
			}
		}
		await this.educationService.remove(id);
		return 'Successfully deleted your education.';
	}

	@ResolveField((returns) => [
		Education
	])
	education(@Parent() profile: Profile): Promise<Education[]> {
		return this.profileService.getEducationItems(profile.id);
	}
}
