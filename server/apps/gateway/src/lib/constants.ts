const isDev = process.env.NODE_ENV === "development";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export { COOKIE_MAX_AGE, isDev };
