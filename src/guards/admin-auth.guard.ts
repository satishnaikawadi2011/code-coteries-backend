import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService, private usersService: UserService) {}

	async canActivate(context: ExecutionContext) {
		const ctx = GqlExecutionContext.create(context).getContext();
		if (ctx.headers.Authorization) {
			Object.assign(ctx.headers, { authorization: ctx.headers.Authorization });
		}
		if (ctx.headers.authorization && ctx.headers.authorization.startsWith('Bearer')) {
			try {
				const token = ctx.headers.authorization.split(' ')[1];
				const decoded = await this.jwtService.verifyAsync(token, { secret: 'thisismysecret' });
				const user = await this.usersService.findOne(decoded.id);
				if (!user || !user.is_admin) {
					return false;
				}
				ctx.userId = decoded.id;
				return true;
			} catch (err) {
				console.log(err);
				return false;
			}
		}
		else {
			return false;
		}
	}
}
