// ============================================================================
// ☁️ BeatMarket — Client S3 (AWS / Cloudflare R2)
// ============================================================================

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-west-3',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  // Pour Cloudflare R2
  ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
});

const BUCKET = process.env.S3_BUCKET_NAME || 'beatmarket-audio';

/**
 * Génère un presigned URL pour l'upload direct depuis le client
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 3600 // 1 heure
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Génère un presigned URL pour le téléchargement sécurisé
 */
export async function getDownloadPresignedUrl(
  key: string,
  filename: string,
  expiresIn = 300 // 5 minutes
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Génère un presigned URL pour le streaming audio (preview)
 */
export async function getStreamPresignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentType: 'audio/mpeg',
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Supprime un fichier du storage
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Génère une clé S3 unique pour un fichier audio
 */
export function generateAudioKey(
  producerId: string,
  trackId: string,
  type: 'original' | 'preview' | 'stems',
  extension: string
): string {
  return `audio/${producerId}/${trackId}/${type}.${extension}`;
}

/**
 * Génère une clé S3 pour une cover art
 */
export function generateCoverKey(
  producerId: string,
  trackId: string
): string {
  return `covers/${producerId}/${trackId}/cover.webp`;
}

export { s3Client };
