import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
	@Query(() => String)
	helloWorld() {
		return 'Hello World !!!';
	}
}
