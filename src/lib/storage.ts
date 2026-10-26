import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
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

            // Ensure directory exists
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const extension = file.type.split('/')[1] || 'jpg';
            const uniqueFilename = `${crypto.randomUUID()}-${Date.now()}.${extension}`;
            const filePath = join(uploadDir, uniqueFilename);

            await writeFile(filePath, buffer);

            // Return public URL path
            return { url: `${UPLOAD_DIR}/${uniqueFilename}` };
        } catch (error) {
            console.error('Failed to upload file to local storage:', error);
            return { error: 'Failed to upload file' };
        }
    }

    async deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Very basic sanitation to prevent directory traversal
            if (url.includes('..')) {
                return { success: false, error: 'Invalid URL' };
            }

            const filename = url.split('/').pop();
            if (!filename) {
                return { success: false, error: 'Invalid filename' };
            }

            const filePath = join(this.getUploadPath(), filename);

            if (existsSync(filePath)) {
                await unlink(filePath);
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to delete file from local storage:', error);
            return { success: false, error: 'Failed to delete file' };
        }
    }
}

// Ensure development & production use appropriate providers
export const storage = new LocalDiskStorageProvider();
