export function delay(millisec) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve('');
		}, millisec);
	});
}

export function validateEmail(email) {
	const emailRegex = /^[^\s@#]+@[^\s@#]+\.[^\s@#]+$/i;
	return emailRegex.test(email);
}
export function validateURL(url) {
	const urlRegex = /^(http(s?):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{0,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=,]*)$/g;
	return urlRegex.test(url);
}
export function validateJSON(json) {
	try {
		JSON.parse(json);
		return true;
	} catch (error) {
		return false;
	}
}
export function validateEmailDomain(email) {
	const invalidDomains = [
		'gmail.com',
		'yahoo.com',
		'hotmail.com',
		'outlook.com',
	];
	const domain = email.split('@')[1];

	return invalidDomains.includes(domain);
}

export function setThemeToPage(theme = 'dark') {
	if (!document) return;

	let htmlElement = document.getElementsByTagName('html')[0];
	htmlElement.setAttribute('data-theme', theme);
}

export function debounce(func, delay = 400) {
	let timeoutId;

	return function () {
		const context = this;
		const args = arguments;

		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func.apply(context, args);
		}, delay);
	};
}

export function queryConstructor(queries = []) {
	return queries.map((query) => {
		return query.key + '<|>' + query.operator + '<|>' + query.value;
	}).join('|,|');
}

export function sortByAsc(a, b, label, preprocess = (a) => a) {
	let aVal = preprocess(a[label]);
	let bVal = preprocess(b[label]);
	let comparison = 0;
	if (aVal > bVal) {
		comparison = 1;
	} else if (aVal < bVal) {
		comparison = -1;
	}
	return comparison;
}

export function transformSnakeToCapitalized(text) {
	if (!text) return text;
    return text
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '); 
}

export function transformToTitleCase(text) {
	if (typeof text !== 'string' || !text) return text;

	return text
		.toLowerCase()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function createSingletonPromiseExecutor(fn) {
	let inProgressPromise = null;

	return async function () {
		if (!inProgressPromise) {
			inProgressPromise = fn().finally(() => {
				inProgressPromise = null;
			});
		}
		return inProgressPromise;
	};
}