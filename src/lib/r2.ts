import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Vercel 대시보드 붙여넣기 시 끝에 \n 들어가는 버그 회피 (dynoblog quirk)
function cleanEnv(key: string): string {
  return (process.env[key] ?? "").replace(/\s+/g, "");
}

const ENDPOINT = cleanEnv("R2_ENDPOINT");
const BUCKET = cleanEnv("R2_BUCKET");
const PUBLIC_URL = cleanEnv("R2_PUBLIC_URL");
const KEY_PREFIX = cleanEnv("R2_KEY_PREFIX") || "yh/";

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: cleanEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: cleanEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  return cachedClient;
}

function ensureConfigured() {
  if (!ENDPOINT || !BUCKET || !PUBLIC_URL) {
    throw new Error(
      "R2 환경변수가 누락됐어요. R2_ENDPOINT / R2_BUCKET / R2_PUBLIC_URL 확인."
    );
  }
}

export function buildKey(kind: "audio" | "photo" | "misc", filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "bin";
  const safe = ext.replace(/[^a-z0-9]/g, "");
  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${KEY_PREFIX}${kind}/${dir}/${ts}-${rand}.${safe}`;
}

export async function signUploadUrl(
  key: string,
  contentType: string,
  expiresInSec = 600
): Promise<string> {
  ensureConfigured();
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), cmd, { expiresIn: expiresInSec });
}

export async function signDownloadUrl(
  key: string,
  expiresInSec = 600
): Promise<string> {
  ensureConfigured();
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(getClient(), cmd, { expiresIn: expiresInSec });
}

export function publicUrlFor(key: string): string {
  ensureConfigured();
  return `${PUBLIC_URL}/${key}`;
}

export function keyFromPublicUrl(url: string): string | null {
  if (!url.startsWith(PUBLIC_URL + "/")) return null;
  return url.slice(PUBLIC_URL.length + 1);
}

export async function downloadObject(key: string): Promise<Buffer> {
  ensureConfigured();
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const res = await getClient().send(cmd);
  if (!res.Body) throw new Error("R2 object body 없음");
  // Node.js Readable → Buffer
  const stream = res.Body as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk as Buffer | string));
  }
  return Buffer.concat(chunks);
}
