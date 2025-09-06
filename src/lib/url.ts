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
export const URL_GET_CUSTOMERS = 'khachhang';
export const URL_CREATE_CUSTOMER = URL_GET_CUSTOMERS + '/createOne';
export const URL_UPDATE_CUSTOMER = URL_GET_CUSTOMERS + '/updateOne';
export const URL_DELETE_CUSTOMER = URL_GET_CUSTOMERS + '/deleteOne';
export const URL_GET_CONTACTS = URL_GET_CUSTOMERS + '/contacts';
export const URL_UPDATE_CONTACTS = URL_GET_CUSTOMERS + '/contacts/updateOne';
export const URL_DELETE_CONTACTS = URL_GET_CUSTOMERS + '/contacts/deleteOne';



// Vendor
export const URL_GET_VENDORS = 'nhacungcap';
export const URL_CREATE_VENDOR = URL_GET_VENDORS + '/createOne';
export const URL_UPDATE_VENDOR = URL_GET_VENDORS + '/updateOne';
export const URL_DELETE_VENDOR = URL_GET_VENDORS + '/deleteOne';





// Group of goods
export const URL_GET_GROUP_OF_GOODS = 'hangHoa/cat';
export const URL_CREATE_GROUP_OF_GOODS = URL_GET_GROUP_OF_GOODS + '/createOne';
export const URL_UPDATE_GROUP_OF_GOODS = URL_GET_GROUP_OF_GOODS + '/updateOne';
export const URL_DELETE_GROUP_OF_GOODS = URL_GET_GROUP_OF_GOODS + '/deleteOne';





// Goods
export const URL_GET_GOODS = 'hanghoa';
export const URL_CREATE_GOODS = URL_GET_GOODS + '/createOne';
export const URL_CREATE_MANY_GOODS = URL_GET_GOODS + '/createMany';
export const URL_UPDATE_GOODS = URL_GET_GOODS + '/updateOne';
export const URL_DELETE_GOODS = URL_GET_GOODS + '/deleteOne';
export const URL_VADIDATE_GOODS = URL_GET_GOODS + '/findNonExistentIds';







// Order
export const URL_GET_ORDERS = 'order';
export const URL_DELETE_ORDER = URL_GET_ORDERS + '/deleteOne';
export const URL_UPDATE_ORDER = URL_GET_ORDERS + '/updateOne';
export const URL_CREATE_ORDER = URL_GET_ORDERS + '/createOne';
export const URL_ORDER_INDEX = URL_GET_ORDERS + '/number';
export const URL_CREATE_MANY_ORDERS = URL_GET_ORDERS + '/createMany';



// Order Lines
export const URL_GET_ORDER_LINES = 'orderline';
export const URL_DELETE_ORDER_LINE = URL_GET_ORDER_LINES + '/deleteOne';
export const URL_UPDATE_ORDER_LINE = URL_GET_ORDER_LINES + '/updateOne';
export const URL_CREATE_ORDER_LINE = URL_GET_ORDER_LINES + '/createOne';
export const URL_CREATE_BATCH_ORDER_LINE = URL_GET_ORDER_LINES + '/createMany';







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