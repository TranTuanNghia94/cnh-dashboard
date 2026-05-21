// Auth
export const URL_LOGIN = 'auth/login';
export const URL_LOGOUT = 'auth/logout';
export const URL_PASSKEYS = 'auth/passkeys';
export const URL_PASSKEYS_REGISTER_OPTIONS = URL_PASSKEYS + '/register/options';
export const URL_PASSKEYS_REGISTER_VERIFY = URL_PASSKEYS + '/register/verify';
export const URL_PASSKEYS_LOGIN_OPTIONS = URL_PASSKEYS + '/login/options';
export const URL_PASSKEYS_LOGIN_VERIFY = URL_PASSKEYS + '/login/verify';
export const URL_PASSKEY_BY_ID = URL_PASSKEYS + '/{credentialId}';


// Role
export const URL_ROLE = 'role';
export const URL_LIST_ROLES = URL_ROLE + '/list';

// Category
export const URL_CATEGORY = 'category';
export const URL_CREATE_CATEGORY = URL_CATEGORY + '/create';
export const URL_GET_ALL_CATEGORIES = URL_CATEGORY + '/list';
export const URL_GET_CATEGORY_BY_ID = URL_CATEGORY + '/{id}';
export const URL_UPDATE_CATEGORY = URL_CATEGORY + '/update';
export const URL_DELETE_CATEGORY = URL_CATEGORY + '/delete/{id}';


// Product
export const URL_PRODUCTS = 'product';
export const URL_CREATE_PRODUCT = URL_PRODUCTS + '/create';
export const URL_GET_ALL_PRODUCTS = URL_PRODUCTS + '/list';
export const URL_GET_PRODUCT_BY_ID = URL_PRODUCTS + '/{id}';
export const URL_GET_PRODUCT_TAX_HISTORY = URL_PRODUCTS + '/{id}/tax-history';
export const URL_GET_PRODUCT_BY_CODE = URL_PRODUCTS + '/code/{code}';
export const URL_DELETE_PRODUCT = URL_PRODUCTS + '/delete/{id}';
export const URL_UPDATE_PRODUCT = URL_PRODUCTS + '/update';
export const URL_UPLOAD_FILE_PRODUCT = URL_PRODUCTS + '/upload-file-product';



// Users
export const URL_USER = 'user';
export const URL_LIST_USERS = URL_USER + '/list';
export const URL_GET_USER_BY_ID = URL_USER + '/{id}';
export const URL_CREATE_USER = URL_USER + '/create';
export const URL_ME = URL_USER + '/me';
export const URL_CHANGE_PASSWORD = URL_ME + '/changePassword';
export const URL_DISABLE_USER = URL_USER + '/disenableOne';
export const URL_UPDATE_USER = URL_USER + '/updateOne';





// Customer
export const URL_CUSTOMER = 'customer';
export const URL_GET_ALL_CUSTOMERS = URL_CUSTOMER + '/list';
export const URL_GET_CUSTOMER_BY_ID = URL_CUSTOMER + '/{id}';
export const URL_CREATE_CUSTOMER = URL_CUSTOMER + '/create';
export const URL_UPDATE_CUSTOMER = URL_CUSTOMER + '/update';
export const URL_DELETE_CUSTOMER = URL_CUSTOMER + '/delete/{id}';
export const URL_GET_CONTACTS = URL_CUSTOMER + '/contacts';
export const URL_UPDATE_CONTACTS = URL_CUSTOMER + '/contacts/update';
export const URL_DELETE_CONTACTS = URL_CUSTOMER + '/contacts/delete/{id}';
export const URL_UPLOAD_FILE_CUSTOMER = URL_CUSTOMER + '/upload-file-customer';

// Address
export const URL_ADDRESS = 'address';
export const URL_GET_ADDRESS_BY_CUSTOMER_ID = URL_ADDRESS + '/list/{customerId}';



// Vendor
export const URL_VENDORS = 'vendor';
export const URL_GET_ALL_VENDORS = URL_VENDORS + '/list';
export const URL_GET_VENDOR_BY_ID = URL_VENDORS + '/{id}';
export const URL_CREATE_VENDOR = URL_VENDORS + '/create';
export const URL_DELETE_VENDOR = URL_VENDORS + '/delete/{id}';
export const URL_UPDATE_VENDOR = URL_VENDORS + '/update';
export const URL_UPLOAD_FILE_VENDOR = URL_VENDORS + '/upload-file-vendor';


// Order
export const URL_ORDER = 'order';
export const URL_GET_ALL_ORDERS = URL_ORDER + '/list';
export const URL_GET_ORDER_BY_CODE = URL_ORDER + '/{code}';
export const URL_CREATE_ORDER = URL_ORDER + '/create';
export const URL_DELETE_ORDER = URL_ORDER + '/delete/{id}';
export const URL_UPDATE_ORDER = URL_ORDER + '/update';
export const URL_UPDATE_ORDER_STATUS = URL_ORDER + '/update-status/{id}';
export const URL_UPLOAD_FILE_BATCH_ORDER = URL_ORDER + '/upload-file-batch-order';
export const URL_UPLOAD_FILE_BATCH_ORDER_ASYNC = URL_ORDER + '/upload-file-batch-order-async';
export const URL_BATCH_ORDER_IMPORT_JOB = URL_ORDER + '/batch-order-import-jobs/{jobId}';


// Order line
export const URL_ORDER_LINE = 'order-line';
export const URL_CREATE_ORDER_LINE = URL_ORDER_LINE + '/create/{orderId}';
export const URL_UPDATE_ORDER_LINE = URL_ORDER_LINE + '/update/{orderId}';
export const URL_DELETE_ORDER_LINE = URL_ORDER_LINE + '/delete/{orderId}';







// Purchase Order
export const URL_PURCHASE_ORDER = 'purchase-order';
export const URL_GET_ALL_PURCHASE_ORDERS = URL_PURCHASE_ORDER + '/list';
export const URL_GET_PURCHASE_ORDER_BY_ID = URL_PURCHASE_ORDER + '/{id}';
export const URL_CREATE_PURCHASE_ORDER = URL_PURCHASE_ORDER + '/create';
export const URL_UPDATE_PURCHASE_ORDER = URL_PURCHASE_ORDER + '/update';
export const URL_DELETE_PURCHASE_ORDER = URL_PURCHASE_ORDER + '/delete/{id}';
export const URL_FIND_PURCHASE_ORDER_LINE_BY_DOCUMENT = URL_PURCHASE_ORDER + '/lines/find-by-document';
export const URL_PO_LINE_PAYMENT_HISTORY = 'purchase-order-line/payment-history';




// Payment Request (new API)
export const URL_PAYMENT_REQUEST = 'payment-request';
export const URL_CREATE_OR_UPDATE_PAYMENT_REQUEST = URL_PAYMENT_REQUEST + '/create-or-update';
export const URL_GET_ALL_PAYMENT_REQUESTS = URL_PAYMENT_REQUEST + '/list';
export const URL_GET_PAYMENT_REQUEST_BY_ID = URL_PAYMENT_REQUEST + '/{id}';
export const URL_UPDATE_PAYMENT_REQUEST = URL_PAYMENT_REQUEST + '/update';
export const URL_DELETE_PAYMENT_REQUEST = URL_PAYMENT_REQUEST + '/delete/{id}';
export const URL_PAYMENT_REQUEST_UPLOAD_FILE = URL_PAYMENT_REQUEST + '/upload-file';
export const URL_PAYMENT_REQUEST_FILES = URL_PAYMENT_REQUEST + '/{id}/uploaded-files';
export const URL_PAYMENT_REQUEST_SEND_TO_ACCOUNTANT = URL_PAYMENT_REQUEST + '/{id}/send-to-accountant';
export const URL_PAYMENT_REQUEST_APPROVE = URL_PAYMENT_REQUEST + '/approve/{id}';
export const URL_PAYMENT_REQUEST_REJECT = URL_PAYMENT_REQUEST + '/reject/{id}';






// Notifications
export const URL_NOTIFICATIONS = 'notifications';
export const URL_NOTIFICATIONS_SUBSCRIBE = URL_NOTIFICATIONS + '/subscribe';
export const URL_NOTIFICATION_MARK_READ = URL_NOTIFICATIONS + '/{id}/read';





// warehouse inbound
export const URL_WAREHOUSE_INBOUND = 'warehouse-inbound';
export const URL_WAREHOUSE_INBOUND_SEARCH = URL_WAREHOUSE_INBOUND + '/search';
export const URL_WAREHOUSE_INBOUND_LIST = URL_WAREHOUSE_INBOUND + '/list';
export const URL_WAREHOUSE_INBOUND_CONFIRM = URL_WAREHOUSE_INBOUND + '/confirm';
export const URL_WAREHOUSE_INBOUND_PAYMENT_REQUEST = URL_WAREHOUSE_INBOUND + '/payment-request/{id}';
export const URL_WAREHOUSE_INBOUND_PAYMENT_REQUEST_RECEIPTS =
  URL_WAREHOUSE_INBOUND + '/payment-request/{id}/receipts';
export const URL_WAREHOUSE_INBOUND_RECEIPT_BY_ID = URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}';
export const URL_WAREHOUSE_INBOUND_SUBMIT = URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}/submit';
export const URL_WAREHOUSE_INBOUND_RECEIPT_APPROVE = URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}/approve';
export const URL_WAREHOUSE_INBOUND_REJECT = URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}/reject';
export const URL_WAREHOUSE_INBOUND_CANCEL = URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}/cancel';
export const URL_WAREHOUSE_INBOUND_RECEIPT_LINES = URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}/lines';
export const URL_WAREHOUSE_INBOUND_RECEIPT_LINE_BY_ID =
  URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}/lines/{lineId}';
export const URL_WAREHOUSE_INBOUND_RECEIPT_UPLOAD_FILE =
  URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}/upload-file';
export const URL_WAREHOUSE_INBOUND_RECEIPT_FILES =
  URL_WAREHOUSE_INBOUND + '/receipt/{receiptId}/files';


// warehouse inventory
export const URL_WAREHOUSE_INVENTORY = 'warehouse-inventory';
export const URL_WAREHOUSE_INVENTORY_LIST = URL_WAREHOUSE_INVENTORY + '/list';
export const URL_WAREHOUSE_INVENTORY_GET_BALANCE = URL_WAREHOUSE_INVENTORY + '/products/{productId}'; // Warehouse inventory get balance
export const URL_WAREHOUSE_INVENTORY_GET_TRANSACTIONS = URL_WAREHOUSE_INVENTORY + '/products/{productId}/transactions'; // Warehouse inventory get transactions

// warehouse outbound
export const URL_WAREHOUSE_OUTBOUND = 'warehouse-outbound';
export const URL_WAREHOUSE_OUTBOUND_ORDER_LINES = URL_WAREHOUSE_OUTBOUND + '/order-lines';
export const URL_WAREHOUSE_OUTBOUND_CREATE = URL_WAREHOUSE_OUTBOUND + '/create';
export const URL_WAREHOUSE_OUTBOUND_LIST = URL_WAREHOUSE_OUTBOUND + '/list';
export const URL_WAREHOUSE_OUTBOUND_DETAIL = URL_WAREHOUSE_OUTBOUND + '/{outboundId}';
export const URL_WAREHOUSE_OUTBOUND_ACTIONS = URL_WAREHOUSE_OUTBOUND + '/{outboundId}/actions';
export const URL_WAREHOUSE_OUTBOUND_SUBMIT = URL_WAREHOUSE_OUTBOUND + '/{outboundId}/submit';
export const URL_WAREHOUSE_OUTBOUND_APPROVE = URL_WAREHOUSE_OUTBOUND + '/{outboundId}/approve';
export const URL_WAREHOUSE_OUTBOUND_REJECT = URL_WAREHOUSE_OUTBOUND + '/{outboundId}/reject';
export const URL_WAREHOUSE_OUTBOUND_CANCEL = URL_WAREHOUSE_OUTBOUND + '/{outboundId}/cancel';
export const URL_WAREHOUSE_OUTBOUND_RESUBMIT = URL_WAREHOUSE_OUTBOUND + '/{outboundId}/resubmit';
export const URL_WAREHOUSE_OUTBOUND_UPLOAD_FILE = URL_WAREHOUSE_OUTBOUND + '/{outboundId}/upload-file';
export const URL_WAREHOUSE_OUTBOUND_FILES = URL_WAREHOUSE_OUTBOUND + '/{outboundId}/files';

// delivery slip
export const URL_DELIVERY_SLIP = 'delivery-slip';
export const URL_DELIVERY_SLIP_BY_WAREHOUSE_OUTBOUND = URL_DELIVERY_SLIP + '/warehouse-outbound/{outboundId}';
export const URL_DELIVERY_SLIP_BY_OUTBOUND_NUMBER = URL_DELIVERY_SLIP + '/outbound-number';








// System
export const URL_SYS = 'system';
export const URL_GET_ALL_ROLES = URL_SYS + '/role';




// Inventory
export const URL_INVENTORY = 'inventory';
export const URL_GET_IMPORT_REQUEST = URL_INVENTORY + '/receiving';
export const URL_GET_EXPORT_REQUEST = URL_INVENTORY + '/take-away';