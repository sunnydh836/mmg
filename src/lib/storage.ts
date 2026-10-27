import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import ImageKit, { toFile } from '@imagekit/nodejs';
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

export class ImageKitStorageProvider implements StorageProvider {
    private getConfig() {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT?.replace(/\/+$/, '');
        if (!privateKey || !urlEndpoint) {
            throw new Error('ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.');
        }
        return { privateKey, urlEndpoint };
    }

    private getClient() {
        const { privateKey } = this.getConfig();
        return new ImageKit({ privateKey });
    }

    async uploadFile(file: File): Promise<{ url?: string; error?: string }> {
        try {
            const fileName = `${crypto.randomUUID()}.${file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] || 'jpg'}`;
            const imageFile = await toFile(Buffer.from(await file.arrayBuffer()), fileName, { type: file.type });
            const uploaded = await this.getClient().files.upload({
                file: imageFile,
                fileName,
                folder: '/products',
                useUniqueFileName: true,
                isPrivateFile: false,
            });
            if (!uploaded.url) return { error: 'ImageKit did not return an image URL' };
            return { url: uploaded.url };
        } catch (error) {
            console.error('Failed to upload file to ImageKit:', error);
            return { error: error instanceof Error ? error.message : 'Failed to upload file to ImageKit' };
        }
    }

    async deleteFile(fileUrl: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { urlEndpoint } = this.getConfig();
            const target = new URL(fileUrl);
            const endpoint = new URL(urlEndpoint);
            if (target.origin !== endpoint.origin || !target.pathname.startsWith(`${endpoint.pathname}/`)) {
                return { success: true };
            }

            const filename = decodeURIComponent(target.pathname.split('/').pop() || '');
            if (!filename) return { success: true };

            // ImageKit deletes by fileId. Search by our unique filename, then verify the exact URL.
            const files = await this.getClient().assets.list({
                type: 'file',
                searchQuery: `name = "${filename}"`,
                limit: 10,
            });
            const normalizedTarget = `${target.origin}${target.pathname}`;
            const match = files.find((file) => {
                if (!("fileId" in file) || !("url" in file) || !file.fileId || !file.url) return false;
                const fileUrl = new URL(file.url);
                return `${fileUrl.origin}${fileUrl.pathname}` === normalizedTarget;
            });
            if (match && "fileId" in match && typeof match.fileId === 'string') {
                await this.getClient().files.delete(match.fileId);
            }
            return { success: true };
        } catch (error) {
            console.error('Failed to delete file from ImageKit:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Failed to delete file from ImageKit' };
        }
    }
}

// Vercel's filesystem is ephemeral. Use ImageKit in production and local disk only in local development.
export const storage: StorageProvider = process.env.NODE_ENV === 'production' || process.env.IMAGEKIT_PRIVATE_KEY
    ? new ImageKitStorageProvider()
    : new LocalDiskStorageProvider();
