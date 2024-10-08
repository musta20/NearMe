import { writeAsyncIterableToWritable } from "@remix-run/node";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function uploadImage(file: File, productId: string): Promise<string> {
  // Ensure the upload directory exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${uuidv4()}-${file.name}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  const writeStream = createWriteStream(filePath);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeStream.write(buffer);
  writeStream.end();

  // Return the public URL for the uploaded file
  return `/uploads/${filename}`;
}