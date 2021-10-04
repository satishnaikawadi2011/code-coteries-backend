import { Tag } from 'src/tag/entities/tag.entity';

export const sortTags = (tags: Tag[]): Tag[] => {
	const updatedTags: Tag[] = [
		...tags
	];
	updatedTags.sort((a, b) => {
		return b.likes.length - a.likes.length;
	});
	return updatedTags;
};
