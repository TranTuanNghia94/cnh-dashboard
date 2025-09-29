// Auth
export const URL_LOGIN = 'auth/login';


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
export const URL_GET_PRODUCT_BY_CODE = URL_PRODUCTS + '/code/{code}';
export const URL_DELETE_PRODUCT = URL_PRODUCTS + '/delete/{id}';
export const URL_UPDATE_PRODUCT = URL_PRODUCTS + '/update';



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


// Order
export const URL_ORDER = 'order';
export const URL_GET_ALL_ORDERS = URL_ORDER + '/list';
export const URL_GET_ORDER_BY_ID = URL_ORDER + '/{id}';
export const URL_CREATE_ORDER = URL_ORDER + '/create';
export const URL_DELETE_ORDER = URL_ORDER + '/delete/{id}';
export const URL_UPDATE_ORDER = URL_ORDER + '/update';









// PO
export const URL_GET_ALL_PO = 'po';








// Payment Request
export const URL_GET_PAYMENT_REQUEST = 'de-nghi-thanh-toan';







// System
export const URL_SYS = 'system';
export const URL_GET_ALL_ROLES = URL_SYS + '/role';




// Inventory
export const URL_INVENTORY = 'inventory';
export const URL_GET_IMPORT_REQUEST = URL_INVENTORY + '/receiving';
export const URL_GET_EXPORT_REQUEST = URL_INVENTORY + '/take-away';