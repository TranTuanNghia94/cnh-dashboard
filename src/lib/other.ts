import moment from "moment";
import type { IPurchaseOrderLineResponse } from "@/types/purchase";

/** Thành tiền dòng PO: SL × đơn giá when both are numeric; otherwise `totalPrice`. */
export const purchaseOrderLineExtendedAmount = (line: IPurchaseOrderLineResponse | undefined | null): number => {
	if (!line) return 0;
	const qty = Number(line.quantity ?? 0);
	const unit = Number(line.unitPrice ?? 0);
	if (Number.isFinite(qty) && Number.isFinite(unit)) return qty * unit;
	const totalPrice = Number(line.totalPrice ?? 0);
	return Number.isFinite(totalPrice) ? totalPrice : 0;
};

// Example: 2000000 -> 2,000,000
export const numberWithCommas = (num: number) => {
	return num?.toLocaleString('en-US', { useGrouping: true });
};

const vnCurrencyFormatter = new Intl.NumberFormat('vi-VN', {
	style: 'currency',
	currency: 'VND',
	maximumFractionDigits: 0,
});

const vnNumberFormatter = new Intl.NumberFormat('vi-VN', {
	maximumFractionDigits: 0,
});

export const formatCurrencyVN = (value: number) => vnCurrencyFormatter.format(value);

export const formatNumberVN = (value: number | undefined) => {
	if (value === undefined || value === null) return '';
	return vnNumberFormatter.format(value);
};

/** PO line totals: VND = whole numbers; USD/EUR/CNY keep up to 2 decimals (avoid 85.6 → 86). */
export const formatPurchaseLineAmount = (value: number | undefined, currency?: string) => {
	if (value === undefined || value === null || !Number.isFinite(value)) return '';
	const curr = String(currency ?? 'VND').trim().toUpperCase() || 'VND';
	if (curr === 'VND') {
		return vnNumberFormatter.format(value);
	}
	return new Intl.NumberFormat('vi-VN', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(value);
};

export const parseFormattedNumber = (formatted: string): number | undefined => {
	const cleaned = formatted.replace(/\./g, '').replace(/,/g, '.').trim();
	const num = Number(cleaned);
	return isNaN(num) ? undefined : num;
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