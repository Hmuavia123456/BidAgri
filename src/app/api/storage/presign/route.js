import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Bucket, getS3Client, getS3PublicBaseUrl } from "@/lib/s3";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function sanitizeFileName(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function sanitizeFolderPath(input) {
  const raw = String(input ?? "");
  const parts = raw
    .split("/")
    .map((segment) => sanitizeFileName(segment))
    .filter(Boolean);

  if (!parts.length) {
    return "uploads";
  }

  return parts.join("/");
}

function ensureEnvReady() {
  try {
    getS3Bucket();
    getS3Client();
  } catch (error) {
    return error instanceof Error ? error.message : "S3 configuration missing.";
  }
  return null;
}

export async function POST(request) {
  const envError = ensureEnvReady();
  if (envError) {
    return NextResponse.json({ message: envError }, { status: 500 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const fileName = sanitizeFileName(String(payload?.fileName ?? ""));
  const fileType = String(payload?.fileType ?? "");
  const fileSize = Number(payload?.fileSize ?? 0);
  const folder = sanitizeFolderPath(payload?.folder ?? "uploads");

  if (!fileName) {
    return NextResponse.json(
      { message: "File name is required." },
      { status: 422 }
    );
  }
  if (!ALLOWED_TYPES.includes(fileType)) {
    return NextResponse.json(
      { message: "File type not allowed." },
      { status: 422 }
    );
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_BYTES) {
    return NextResponse.json(
      { message: "File is too large (max 5MB)." },
      { status: 422 }
    );
  }

  const timestamp = Date.now();
  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  const ext = fileName.includes(".") ? fileName.split(".").pop() : "";
  const safeName = ext
    ? `${fileName}`
    : `${fileName}.${fileType.split("/").pop() || "dat"}`;
  const key = `${folder}/${timestamp}-${uniqueSuffix}-${safeName}`;

  const bucket = getS3Bucket();
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
  });

  try {
    const url = await getSignedUrl(client, command, { expiresIn: 60 });
    const publicBase = getS3PublicBaseUrl();
    return NextResponse.json({
      url,
      key,
      publicUrl: `${publicBase}/${key}`,
    });
  } catch (error) {
    console.error("Error generating S3 presigned URL", error);
    return NextResponse.json(
      { message: "Failed to generate upload URL." },
      { status: 500 }
    );
  }
}
