export const QUERIES = {
	// Auth
    LOGIN: 'login',
    AUTH: 'auth',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',

	// User
    USERS: 'users',
	ME: 'me',
	GET_USER_BY_ID: 'get-user-by-id',
	GET_USER_BY_CODE: 'get-user-by-code',
	CHANGE_PASSWORD: 'change-password',
	ALL_ROLES: 'all-roles',
	DISABLE_USER: 'disable-user',
	CREATE_USER: 'create-user',
	UPDATE_USER: 'update-user',

	// Category
	CATEGORY: 'category',
	CREATE_CATEGORY: 'create-category',
	GET_CATEGORY: 'get-category',
	UPDATE_CATEGORY: 'update-category',
	DELETE_CATEGORY: 'delete-category',

	// Customer
	CUSTOMERS: 'customers',
	CREATE_CUSTOMER: 'create-customer',
	GET_CUSTOMER: 'get-customer',
	UPDATE_CUSTOMER: 'update-customer',
	DELETE_CUSTOMER: 'delete-customer',
	GET_CUSTOMER_ADDRESS: 'get-customer-address',
	UPLOAD_FILE_CUSTOMER: 'upload-file-customer',


	// Vendor
	VENDORS: 'vendors',
	CREATE_VENDOR: 'create-vendor',
	GET_VENDOR: 'get_vendor',
	UPDATE_VENDOR: 'update-vendor',
	DELETE_VENDOR: 'delete-vendor',
	UPLOAD_FILE_VENDOR: 'upload-file-vendor',


	// Group of goods
	GROUP_OF_GOODS: 'group-of-goods',
	CREATE_GROUP_OF_GOODS: 'create-group-of-goods',
	GET_GROUP_OF_GOODS: 'get-group-of-goods',
	UPDATE_GROUP_OF_GOODS: 'update-group-of-goods',


	// Product
	PRODUCT: 'product',
	CREATE_PRODUCT: 'create-product',
	GET_PRODUCT: 'get-product',
	UPDATE_PRODUCT: 'update-product',
	DELETE_PRODUCT: 'delete-product',
	UPLOAD_FILE_PRODUCT: 'upload-file-product',


	// Order
	ORDERS: 'orders',
	CREATE_ORDER: 'create-order',
	GET_ORDER: 'get-order',
	UPDATE_ORDER: 'update-order',
	UPDATE_ORDER_STATUS: 'update-order-status',
	DELETE_ORDER: 'delete-order',

	// Order line
	ORDER_LINE: 'order-line',
	CREATE_ORDER_LINE: 'create-order-line',
	UPDATE_ORDER_DETAIL: 'update-order-detail',
	DELETE_ORDER_DETAIL: 'delete-order-detail',

	// Purchase
	PURCHASES: 'purchases',
	CREATE_PURCHASE: 'create-purchase',



	// Payment
	PAYMENT: 'payment',
	CREATE_OR_UPDATE_PAYMENT: 'create-or-update-payment',
	GET_PAYMENT_BY_ID: 'get-payment-by-id',
	UPDATE_PAYMENT: 'update-payment',
	UPLOAD_FILE_PAYMENT: 'upload-file-payment',
	GET_PAYMENT_REQUEST_FILES_BY_ID: 'get-payment-request-files-by-id',
	SEND_PAYMENT_REQUEST_TO_ACCOUNTANT: 'send-payment-request-to-accountant',
	APPROVE_PAYMENT_REQUEST: 'approve-payment-request',
	REJECT_PAYMENT_REQUEST: 'reject-payment-request',

	// Notifications
	NOTIFICATIONS_INBOX: 'notifications-inbox',

	// Inventory
	INVENTORY_STOCK: 'inventory-stock',
	INVENTORY_OUT: 'inventory-out',
	INVENTORY_IN: 'inventory-in',
	INVENTORY_IN_DETAIL: 'inventory-in-detail',
	INVENTORY_OUT_DETAIL: 'inventory-out-detail',

	WAREHOUSE_INBOUND_SEARCH: 'warehouse-inbound-search',
	WAREHOUSE_INBOUND_PAYMENT_REQUEST: 'warehouse-inbound-payment-request',
	WAREHOUSE_INBOUND_RECEIPTS: 'warehouse-inbound-receipts',
	WAREHOUSE_INBOUND_RECEIPT: 'warehouse-inbound-receipt',
	WAREHOUSE_INBOUND_CONFIRM: 'warehouse-inbound-confirm',
	WAREHOUSE_INBOUND_ADD_LINE: 'warehouse-inbound-add-line',
	WAREHOUSE_INBOUND_PATCH_LINE: 'warehouse-inbound-patch-line',
	WAREHOUSE_INBOUND_DELETE_LINE: 'warehouse-inbound-delete-line',
	WAREHOUSE_INBOUND_SUBMIT: 'warehouse-inbound-submit',
	WAREHOUSE_INBOUND_APPROVE: 'warehouse-inbound-approve',
	WAREHOUSE_INBOUND_REJECT: 'warehouse-inbound-reject',
	WAREHOUSE_INBOUND_CANCEL: 'warehouse-inbound-cancel',
	WAREHOUSE_INBOUND_LIST: 'warehouse-inbound-list',
	WAREHOUSE_INBOUND_UPLOAD_FILE: 'warehouse-inbound-upload-file',
	WAREHOUSE_INBOUND_LIST_FILES: 'warehouse-inbound-list-files',
}

export const LIST_ROLES = {
	SHIPPING_COORDINATOR: {
		code: 'SHIPPING_COORDINATOR',
		name: 'Vận chuyển',
	},
	INVENTORY_AUDITOR: {
		code: 'INVENTORY_AUDITOR',
		name: 'Kiểm kho',
	},
	ADMIN: {
		code: 'ADMIN',
		name: 'Admin',
	},
	REPORTER: {
		code: 'REPORTER',
		name: 'Báo cáo',
	},
	CS: {
		code: 'CS',
		name: 'CS',
	},
	CS_MANAGER: {
		code: 'CS_MANAGER',
		name: 'Quản lý CS',
	},
	ACCOUNTANT: {
		code: 'ACCOUNTANT',
		name: 'Kế toán',
	},
	DIRECTOR: {
		code: 'DIRECTOR',
		name: 'Giám đốc',
	},
	ACCOUNTANT_MANAGER: {
		code: 'ACCOUNTANT_MANAGER',
		name: 'Kế toán trưởng',
	},
	USER: {
		code: 'USER',
		name: 'Nhân viên',
	}
}

export const SELL_STATUS = {
	'Nháp': 'Nháp',
	'Chờ duyệt': 'Chờ duyệt',
	'Chờ thanh toán': 'Chờ thanh toán',
	'Đã thanh toán một phần': 'Đã thanh toán một phần',
	'Đã thanh toán 100%': 'Đã thanh toán 100%',
};

export const MAX_PAYLOAD_SIZE = 300;
export const MAX_PAYLOAD_ORDER_SIZE = 5;


export const EMAIL_REGEX = "@iesvietnam.com"


export const ORDER_STATUS_LABELS: Record<string, string> = {
	DRAFT: "Bản nháp", // Bản nháp
    PENDING: "Chờ thanh toán", // Chờ thanh toán
    PAID: "Thanh toán 100%", // Thanh toán 100%
    PARTIALLY_PAID: "Thanh toán một phần", // Thanh toán một phần
    SHIPPED: "Giao hàng", // Giao hàng
    COMPLETED: "Hoàn thành", // Hoàn thành
    CANCELLED: "Hủy", // Hủy
    REJECTED: "Từ chối", // Từ chối
  }
  
  export const ORDER_STATUS_STYLES: Record<string, string> = {
	DRAFT: 'bg-amber-100 text-amber-800',
	PENDING: 'bg-blue-100 text-blue-800',
	PAID: 'bg-emerald-100 text-emerald-800',
	PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
	SHIPPED: 'bg-green-100 text-green-800',
	COMPLETED: 'bg-primary/10 text-primary',
	CANCELLED: 'bg-rose-100 text-rose-800',
	REJECTED: 'bg-red-100 text-red-800',
	DEFAULT: 'bg-muted text-muted-foreground',
  }

export const PAYMENT_REQUEST_STATUS_DRAFT = "DRAFT";
export const PAYMENT_REQUEST_STATUS_SUBMITTED = "SUBMITTED";
export const PAYMENT_REQUEST_STATUS_PENDING_ACCOUNTANT_APPROVAL = "PENDING_ACC_APPROVAL";
export const PAYMENT_REQUEST_STATUS_PENDING_HEAD_ACCOUNTANT_APPROVAL = "PENDING_HEAD_ACC_APR";
export const PAYMENT_REQUEST_STATUS_PENDING_FINAL_APPROVAL = "PENDING_FINAL_APR";
export const PAYMENT_REQUEST_STATUS_APPROVED = "APPROVED";
export const PAYMENT_REQUEST_STATUS_PARTIALLY_PAID = "PARTIALLY_PAID";
export const PAYMENT_REQUEST_STATUS_PAID = "PAID";
export const PAYMENT_REQUEST_STATUS_REJECTED = "REJECTED";
export const PAYMENT_REQUEST_STATUS_CANCELLED = "CANCELLED";


export const PAYMENT_REQUEST_STATUS_STYLES: Record<string, { label: string; style: string }> = {
	[PAYMENT_REQUEST_STATUS_DRAFT]: {
		label: 'Nháp',
		style: 'text-gray-500 font-bold bg-gray-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_SUBMITTED]: {
		label: 'Chờ duyệt',
		style: 'text-blue-500 font-bold bg-blue-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_PENDING_ACCOUNTANT_APPROVAL]: {
		label: 'Chờ duyệt 1',
		style: 'text-orange-500 font-bold bg-orange-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_PENDING_HEAD_ACCOUNTANT_APPROVAL]: {
		label: 'Chờ duyệt 2',
		style: 'text-orange-500 font-bold bg-orange-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_PENDING_FINAL_APPROVAL]: {
		label: 'Xử lý',
		style: 'font-bold text-orange-500 bg-orange-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_APPROVED]: {
		label: 'Đã duyệt',
		style: 'text-indigo-600 font-bold bg-indigo-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_PARTIALLY_PAID]: {
		label: 'TT một phần',
		style: 'text-amber-600 font-bold bg-amber-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_PAID]: {
		label: 'Đã thanh toán',
		style: 'text-green-500 font-bold bg-green-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_REJECTED]: {
		label: 'Bị từ chối',
		style: 'text-red-500 font-bold bg-red-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	[PAYMENT_REQUEST_STATUS_CANCELLED]: {
		label: 'Đã huỷ',
		style: 'text-gray-500 font-bold bg-gray-100 rounded-md px-2 py-1 text-center shadow-md',
	},
}


export const PAYMENT_REQUEST_FEE_TYPE_OPTIONS = [
	{ value: 'SHIPPING', label: 'Vận chuyển' },
	{ value: 'CUSTOMS', label: 'Hải quan' },
	{ value: 'INSURANCE', label: 'Bảo hiểm' },
	{ value: 'HANDLING', label: 'Bốc xếp' },
	{ value: 'OTHER', label: 'Khác' },
]


export const CURRENCY_OPTIONS = ['VND', 'USD', 'EUR', 'CNY', 'JPY', 'SGD', 'HKD', 'GBP', 'AUD', 'CAD', 'CHF', 'SEK', 'NZD', 'MXN']

export type PaymentMode = 'FULL' | 'PARTIAL'


export const PAYMENT_REQUEST_FILE_CATEGORY = {
	PAPERS: 'papers',
	BANK_NOTE: 'bank-note',
}

export const WAREHOUSE_INBOUND_STATUS_STYLES: Record<string, { label: string; style: string }> = {
	DRAFT: {
		label: 'Nháp',
		style: 'text-gray-500 font-bold bg-gray-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	SUBMITTED: {
		label: 'Chờ duyệt',
		style: 'text-blue-500 font-bold bg-blue-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	REJECTED: {
		label: 'Bị từ chối',
		style: 'text-red-500 font-bold bg-red-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	APPROVED: {
		label: 'Đã duyệt',
		style: 'text-indigo-600 font-bold bg-indigo-100 rounded-md px-2 py-1 text-center shadow-md',
	},
	CANCELLED: {
		label: 'Đã huỷ',
		style: 'text-gray-500 font-bold bg-gray-100 rounded-md px-2 py-1 text-center shadow-md',
	},
}