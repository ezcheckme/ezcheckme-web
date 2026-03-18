/**
 * Typed environment configuration.
 * All values sourced from VITE_* env vars defined in .env.{development,qa,production}.
 */

interface ApiConfig {
  url: string;
  /** The real API Gateway URL — needed for SigV4 signing even when using a dev proxy */
  realUrl: string;
}

interface CognitoConfig {
  region: string;
  poolId: string;
  clientId: string;
  identityPoolId: string;
  attendeePoolId: string;
  mobileClientId: string;
  domain: string;
}

interface IotConfig {
  region: string;
  domain: string;
  topic: string;
}

interface BlogConfig {
  apiUrl: string;
  yoastUrl: string;
}

interface MapsConfig {
  googleMapsKey: string;
  geocodingKey: string;
}

interface GeneralConfig {
  env: string;
  hostUrl: string;
  checkinUrl: string;
  heroImagesDomain: string;
}

export interface AppConfig {
  api: ApiConfig;
  cognito: CognitoConfig;
  iot: IotConfig;
  blog: BlogConfig;
  maps: MapsConfig;
  general: GeneralConfig;
}

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config: AppConfig = {
  api: {
    url: requireEnv("VITE_API_URL"),
    realUrl: requireEnv("VITE_API_REAL_URL"),
  },
  cognito: {
    region: requireEnv("VITE_COGNITO_REGION"),
    poolId: requireEnv("VITE_COGNITO_POOL_ID"),
    clientId: requireEnv("VITE_COGNITO_CLIENT_ID"),
    identityPoolId: requireEnv("VITE_COGNITO_IDENTITY_POOL_ID"),
    attendeePoolId: requireEnv("VITE_COGNITO_ATTENDEE_POOL_ID"),
    mobileClientId: requireEnv("VITE_COGNITO_MOBILE_CLIENT_ID"),
    domain: requireEnv("VITE_COGNITO_DOMAIN"),
  },
  iot: {
    region: requireEnv("VITE_IOT_REGION"),
    domain: requireEnv("VITE_IOT_DOMAIN"),
    topic: requireEnv("VITE_IOT_TOPIC"),
  },
  blog: {
    apiUrl: requireEnv("VITE_BLOG_API_URL"),
    yoastUrl: requireEnv("VITE_BLOG_YOAST_URL"),
  },
  maps: {
    googleMapsKey: requireEnv("VITE_GOOGLE_MAPS_KEY"),
    geocodingKey: requireEnv("VITE_GOOGLE_GEOCODING_KEY"),
  },
  general: {
    env: requireEnv("VITE_ENV"),
    hostUrl: requireEnv("VITE_HOST_URL"),
    checkinUrl: requireEnv("VITE_CHECKIN_URL"),
    heroImagesDomain: requireEnv("VITE_HERO_IMAGES_DOMAIN"),
  },
};

export const isDev = config.general.env === "dev";
export const isProd = config.general.env === "prod";
export const isQa = config.general.env === "qa";
