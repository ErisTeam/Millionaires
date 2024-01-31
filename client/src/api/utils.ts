import { API_URL } from '@/constants';

export function toggleFollow(userID: string, token: string) {
	return fetch(`${API_URL}/togglePin`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`,
		},
		body: JSON.stringify({ profileID: userID }),
	}).then((res) => {
		if (res.status === 200) {
			return true;
		} else {
			return false;
		}
	});
}
export function toggleLike(postID: string, token: string) {
	return fetch(`${API_URL}/toggleLike`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`,
		},
		body: JSON.stringify({ postID: postID }),
	}).then((res) => {
		if (res.status === 200) {
			return true;
		} else {
			return false;
		}
	});
}

export function togglePin(postID: string, token: string) {
	return fetch(`${API_URL}/togglePin`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`,
		},
		body: JSON.stringify({ postID: postID }),
	}).then((res) => {
		if (res.status === 200) {
			return true;
		} else {
			return false;
		}
	});
}

export function deletePost(postID: string, token: string) {
	return fetch(`${API_URL}/post`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${token}`,
		},
		body: JSON.stringify({ postID: postID }),
	}).then((res) => {
		if (res.status === 200) {
			return true;
		} else {
			return false;
		}
	});
}

export function getPins(token: string) {
	console.log('getting pins');
	return fetch(`${API_URL}/pins/0`, {
		method: 'GET',

		headers: {
			Authorization: `${token}`,
			'Content-Type': 'application/json',
		},
	}).then((res) => {
		if (res.status === 200) {
			return res.json();
		} else {
			return false;
		}
	});
}

export function getPosts(username: string) {
	return fetch(`${API_URL}/postsProfile/${username}/0`, {
		method: 'GET',

		headers: {
			'Content-Type': 'application/json',
		},
	}).then((res) => {
		if (res.status === 200) {
			return res.json();
		} else {
			return false;
		}
	});
}
