import { S3Client } from "@aws-sdk/client-s3";

let cachedClient;

export function getS3Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const region = process.env.AWS_S3_REGION || process.env.NEXT_PUBLIC_AWS_S3_REGION;
  if (!region) {
    throw new Error("AWS_S3_REGION is not defined. Set it in your environment to use S3 uploads.");
  }

  const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

  const credentials =
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined;

  cachedClient = new S3Client({
    region,
    credentials,
  });

  return cachedClient;
}

export function getS3Bucket() {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET is not defined. Set it in your environment to use S3 uploads.");
  }
  return bucket;
}

export function getS3PublicBaseUrl() {
  if (process.env.AWS_S3_PUBLIC_URL) {
    return process.env.AWS_S3_PUBLIC_URL.replace(/\/+$/, "");
  }

  const bucket = getS3Bucket();
  const region = process.env.AWS_S3_REGION || process.env.NEXT_PUBLIC_AWS_S3_REGION;
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}
