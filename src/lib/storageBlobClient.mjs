import { BlobServiceClient } from "@azure/storage-blob";
import { APP_ENV_STORAGE_CONNECTION } from "./env.mjs";

export const storageBlobClient = BlobServiceClient.fromConnectionString(
  APP_ENV_STORAGE_CONNECTION
);
