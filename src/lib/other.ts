import moment from "moment";

// Example: 2000000 -> 2,000,000
export const numberWithCommas = (num: number) => {
	return num?.toLocaleString('en-US', { useGrouping: true });
};

export const isValidISBN = (isbn: string): boolean => {
	isbn = isbn.replace(/-/g, ""); // remove hyphens

	if (isbn.length === 10) {
		let sum = 0;
		for (let i = 0; i < 10; i++) {
			if (isNaN(parseInt(isbn[i]))) {
				return false;
			}
			sum += parseInt(isbn[i]) * (10 - i);
		}
		return sum % 11 === 0;
	} else if (isbn.length === 13) {
		let sum = 0;
		for (let i = 0; i < 13; i += 2) {
			sum += parseInt(isbn[i]);
		}
		for (let i = 1; i < 12; i += 2) {
			sum += 3 * parseInt(isbn[i]);
		}
		return sum % 10 === 0;
	} else {
		return false;
	}
};


export const convertStringDate = (dateString: string) => {
	// Parse the date string using Moment.js
	const date = moment(dateString, 'DD/MM/YYYY');

	// Return the date in ISO 8601 format
	return date.toISOString();
}