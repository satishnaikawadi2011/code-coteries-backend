import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Comment } from './comment';

@ObjectType()
@Entity({ name: 'post_comments' })
export class PostComment extends Comment {
	@Field((type) => User)
	@ManyToOne(() => User, (user) => user.post_comments)
	@JoinColumn()
	user: User;

	@Field((type) => Post)
	@ManyToOne(() => Post, (post) => post.comments)
	@JoinColumn()
	post: Post;
}
