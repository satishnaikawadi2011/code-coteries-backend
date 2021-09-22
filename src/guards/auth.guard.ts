import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private jwtService: JwtService, private usersService: UserService) {}

	async canActivate(context: ExecutionContext) {
		const ctx = GqlExecutionContext.create(context).getContext();
		if (ctx.headers.Authorization) {
			Object.assign(ctx.headers, { authorization: ctx.headers.Authorization });
		}
		if (ctx.headers.authorization && ctx.headers.authorization.startsWith('Bearer')) {
			try {
				const token = ctx.headers.authorization.split(' ')[1];
				// console.log('Got token', token);
				const decoded = await this.jwtService.verifyAsync(token, { secret: 'thisismysecret' });
				ctx.userId = decoded.id;
				return true;
			} catch (err) {
				console.log(err);
				return false;
			}
		}
		else {
			// console.log('No header');
			return false;
		}
	}
}
