import { BadRequestException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context, ResolveField, Parent, Int } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';
import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { EditProfileInput } from './inputs/edit-profile.input';
import { SigninUserInput } from './inputs/signin-user.input';
import { ProfileService } from './profile.service';
import { AuthResponse } from './types/auth-response.type';
import { UserService } from './user.service';

@Resolver((of) => User)
export class UserResolver {
	constructor(
		private usersService: UserService,
		private authService: AuthService,
		private profileService: ProfileService
	) {}

	@Query((returns) => User)
	@UseGuards(AuthGuard)
	async me(@Context('userId') userId: string): Promise<User> {
		await this.usersService.getFollowings(userId);
		const user = await this.usersService.findOne(userId);
		if (!user) {
			throw new BadRequestException('user with given id not found!');
		}
		return user;
	}

	@Mutation((returns) => AuthResponse)
	async registerUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<AuthResponse> {
		return this.authService.signup(createUserInput);
	}

	@Mutation((returns) => AuthResponse)
	async signinUser(@Args('signinUserInput') signinUserInput: SigninUserInput): Promise<AuthResponse> {
		return this.authService.signin(signinUserInput);
	}

	@Mutation((returns) => Profile)
	@UseGuards(AuthGuard)
	async editProfile(
		@Args('editProfileInput') editProfileInput: EditProfileInput,
		@Context('userId') userId: string
	): Promise<Profile> {
		const user = await this.usersService.findOne(userId, {
			relations:
				[
					'profile'
				]
		});
		let profile;
		if (!user.profile) {
			profile = await this.profileService.create(editProfileInput);
		}
		else {
			profile = await this.profileService.update(user.profile.id, editProfileInput);
		}
		user.profile = profile;
		this.usersService.save(user);
		return profile;
	}

	@Mutation((returns) => User)
	@UseGuards(AuthGuard)
	async followUser(@Context('userId') myId: string, @Args('id') userId: string): Promise<User> {
		const me = await this.usersService.findOne(myId, {
			relations:
				[
					'connections'
				]
		});

		me.connections.forEach((conn) => {
			if (conn.id === userId) {
				throw new BadRequestException('You are already following this user !!');
			}
		});

		const otherUser = await this.usersService.findOne(userId);

		if (me.connections)
			if (!me.connections) {
				me.connections = [
					otherUser
				];
			}
			else {
				me.connections.push(otherUser);
			}
		return this.usersService.save(me);
	}

	@Mutation((returns) => String)
	@UseGuards(AuthGuard)
	async unfollowUser(@Context('userId') myId: string, @Args('id') userId: string): Promise<string> {
		const me = await this.usersService.findOne(myId, {
			relations:
				[
					'connections'
				]
		});

		const isFollowing = me.connections.find((conn) => conn.id === userId);

		if (!isFollowing) {
			throw new BadRequestException('You are not following this user !!');
		}
		const updatedConnections = me.connections.filter((conn) => conn.id !== userId);
		me.connections = updatedConnections;
		await this.usersService.save(me);
		return 'Successfully unfollowed user !!';
	}

	@Query((returns) => [
		User
	])
	@UseGuards(AuthGuard)
	getMyFollowers(@Context('userId') userId: string): Promise<User[]> {
		return this.usersService.getFollowers(userId);
	}

	@Query((returns) => [
		User
	])
	@UseGuards(AuthGuard)
	getMyFollowings(@Context('userId') userId: string): Promise<User[]> {
		return this.usersService.getFollowings(userId);
	}

	@ResolveField((returns) => [
		User
	])
	connections(@Parent() user: User): Promise<User[]> {
		return this.usersService.getConnections(user);
	}

	@ResolveField((returns) => Int)
	followerCount(@Parent() user: User): Promise<number> {
		return this.usersService.getFollowerCount(user.id);
	}

	@ResolveField((returns) => Int)
	followingCount(@Parent() user: User): Promise<number> {
		return this.usersService.getFollowingCount(user.id);
	}
}
