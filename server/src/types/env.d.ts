declare namespace NodeJS {
  interface ProcessEnv {
    COOKIE_DOMAIN?: string;
    JWT_EXPIRE?: string;
    JWT_SECRET?: string;
    MONGODB_URI?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
  }
}
