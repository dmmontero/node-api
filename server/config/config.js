/** Port configuration */
process.env.PORT = process.env.PORT || 3000;

/**
 * Entorno NODE
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


/**
 * Token expitation time (30 days)
 * 60 seg
 * 60 min
 * 24 hours
 * 30 days
 */
process.env.CADUCIDAD_TOKEN = '30 days';

/**
 * Token seed
 */
process.env.SEED = process.env.SEED || "token-seed-de-desarrollo";

/**
 * Entorno 
 */
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.urlDB = urlDB;

/**
 * Google Client ID
 */
process.env.CLIENT_ID = process.env.CLIENT_ID || "788159273881-dovc6f5lvf5q0qlr6ib4g6recb8946ib.apps.googleusercontent.com";