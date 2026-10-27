import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { del, put } from '@vercel/blob';
import { UPLOAD_DIR } from './constants';
import { existsSync } from 'fs';

export interface StorageProvider {
    uploadFile(file: File): Promise<{ url?: string; error?: string }>;
    deleteFile(url: string): Promise<{ success: boolean; error?: string }>;
}

export class LocalDiskStorageProvider implements StorageProvider {
    private getUploadPath() {
        return join(process.cwd(), 'public', UPLOAD_DIR);
    }

    async uploadFile(file: File): Promise<{ url?: string; error?: string }> {
        try {
            const uploadDir = this.getUploadPath();
            if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

            const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] || 'jpg';
            const uniqueFilename = `${crypto.randomUUID()}-${Date.now()}.${extension}`;
            await writeFile(join(uploadDir, uniqueFilename), Buffer.from(await file.arrayBuffer()));
            return { url: `${UPLOAD_DIR}/${uniqueFilename}` };
        } catch (error) {
            console.error('Failed to upload file to local storage:', error);
            return { error: 'Failed to upload file' };
        }
    }

    async deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
        try {
            if (!url.startsWith(`${UPLOAD_DIR}/`)) return { success: true };
            if (url.includes('..')) return { success: false, error: 'Invalid URL' };
            const filename = url.split('/').pop();
            if (!filename) return { success: false, error: 'Invalid filename' };
            const filePath = join(this.getUploadPath(), filename);
            if (existsSync(filePath)) await unlink(filePath);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete file from local storage:', error);
            return { success: false, error: 'Failed to delete file' };
        }
    }
}

export class VercelBlobStorageProvider implements StorageProvider {
    async uploadFile(file: File): Promise<{ url?: string; error?: string }> {
        try {
            const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] || 'jpg';
            const blob = await put(`products/${crypto.randomUUID()}.${extension}`, file, {
                access: 'public',
                contentType: file.type || 'application/octet-stream',
                addRandomSuffix: true,
            });
            return { url: blob.url };
        } catch (error) {
            console.error('Failed to upload file to Vercel Blob:', error);
            return { error: error instanceof Error ? error.message : 'Failed to upload file to Vercel Blob' };
        }
    }

    async deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.public.blob.vercel-storage.com')) {
                return { success: true };
            }
            await del(url);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete file from Vercel Blob:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Failed to delete file from Vercel Blob' };
        }
    }
}

// Vercel's filesystem is ephemeral. Use Blob in production and local disk only for local development.
export const storage: StorageProvider = process.env.NODE_ENV === 'production' || process.env.BLOB_READ_WRITE_TOKEN
    ? new VercelBlobStorageProvider()
    : new LocalDiskStorageProvider();
