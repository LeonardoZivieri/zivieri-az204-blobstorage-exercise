import { randomUUID } from "node:crypto";
import { config } from "dotenv";

config();

export const INSTANCE_ID = randomUUID();

export const APP_ENV_STORAGE_CONNECTION =
  process.env.APP_ENV_STORAGE_CONNECTION || "";
