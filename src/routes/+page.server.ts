import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const search = formData.get('search');
		throw redirect(303, `/search/${search}`);
	}
};
