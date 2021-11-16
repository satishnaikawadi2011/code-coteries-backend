import { AuthGuard } from './../guards/auth.guard';
import { BadGatewayException, BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { EducationService } from './education.service';
import { Education } from './entities/education.entity';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';
import { EditEducationInput } from './inputs/edit-education.input';
import { Experience } from './entities/experience.entity';
import { AddExperienceInput } from './inputs/add-experience.input';
import { ExperienceService } from './experience.service';
import { EditExperienceInput } from './inputs/edit-experience.input';
import { Social } from './entities/social.entity';
import { EditSocialInput } from './inputs/edit-social.input';
import { SocialService } from './social.service';

@Resolver((of) => Profile)
export class ProfileResolver {
	constructor(
		private usersService: UserService,
		private profileService: ProfileService,
		private educationService: EducationService,
		private experienceService: ExperienceService,
		private socialService: SocialService
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

	@Mutation((returns) => Experience)
	@UseGuards(AuthGuard)
	async addExperience(
		@Args('addExperienceInput') addExperienceInput: AddExperienceInput,
		@Context('userId') userId: string
	): Promise<Experience> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile',
					'profile.experience'
				]
		});
		if (!user.profile) {
			throw new BadRequestException('First create profile and then add experience items !!');
		}
		const experience = await this.experienceService.create(addExperienceInput);
		if (!user.profile.experience) {
			user.profile.experience = [
				experience
			];
		}
		else {
			user.profile.experience.push(experience);
		}
		this.profileService.save(user.profile);
		return experience;
	}

	@Mutation((returns) => Experience)
	@UseGuards(AuthGuard)
	async editExperience(
		@Args('id') id: string,
		@Args('editExperienceInput') editExperienceInput: EditExperienceInput,
		@Context('userId') userId: string
	): Promise<Experience> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile',
					'profile.experience'
				]
		});
		if (!user.profile || !user.profile.experience) {
			throw new BadGatewayException('You are not allowed to edit this experience !');
		}
		else {
			const isMyExp = await this.experienceService.isMyExperience(user.profile.id, id);
			if (!isMyExp) {
				throw new BadGatewayException('You are not allowed to edit this experience !');
			}
		}
		const updatedExp = await this.experienceService.update(id, editExperienceInput);
		return updatedExp;
	}

	@Mutation((returns) => String)
	@UseGuards(AuthGuard)
	async removeExperience(@Args('id') id: string, @Context('userId') userId: string): Promise<string> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile',
					'profile.experience'
				]
		});
		if (!user.profile || !user.profile.experience) {
			throw new BadGatewayException('You are not allowed to remove this experience !');
		}
		else {
			const isMyExp = await this.experienceService.isMyExperience(user.profile.id, id);
			if (!isMyExp) {
				throw new BadGatewayException('You are not allowed to remove this experience !');
			}
		}
		await this.experienceService.remove(id);
		return 'Successfully deleted your experience.';
	}

	@Mutation((returns) => Social)
	@UseGuards(AuthGuard)
	async editSocial(
		@Args('editSocialInput') editSocialInput: EditSocialInput,
		@Context('userId') userId: string
	): Promise<Social> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile',
					'profile.social'
				]
		});

		if (!user.profile) {
			throw new BadRequestException('First create profile and then add social links !!');
		}

		let social;
		if (!user.profile.social) {
			social = await this.socialService.create(editSocialInput);
		}
		else {
			social = await this.socialService.update(user.profile.social.id, editSocialInput);
		}
		user.profile.social = social;
		this.profileService.save(user.profile);
		return social;
	}

	@Query((returns) => Social)
	@UseGuards(AuthGuard)
	async getMySocial(@Context('userId') userId: string): Promise<Social> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile',
					'profile.social'
				]
		});
		let social;
		if (!user.profile.social) {
			social = await this.socialService.create({});
			user.profile.social = social;
			this.profileService.save(user.profile);
		}
		else {
			social = user.profile.social;
		}
		return social;
	}

	@Mutation((returns) => Profile)
	@UseGuards(AuthGuard)
	async editUserAvatar(@Args('url') url: string, @Context('userId') userId: string): Promise<Social> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile'
				]
		});

		let profile;
		if (!user.profile) {
			profile = await this.profileService.create({ image_url: url });
		}
		else {
			profile = await this.profileService.update(user.profile.id, { image_url: url });
		}
		user.profile = profile;
		this.usersService.save(user);
		return profile;
	}

	@ResolveField((returns) => [
		Education
	])
	education(@Parent() profile: Profile): Promise<Education[]> {
		return this.profileService.getEducationItems(profile.id);
	}

	@ResolveField((returns) => [
		Experience
	])
	experience(@Parent() profile: Profile): Promise<Experience[]> {
		return this.profileService.getExperienceItems(profile.id);
	}

	@ResolveField((returns) => Social)
	social(@Parent() profile: Profile): Promise<Social> {
		return this.profileService.getSocials(profile.id);
	}
}
