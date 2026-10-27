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
            if (!url.startsWith(`${UPLOAD_DIR}/`)) {
                return { success: true };
            }

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

function encodeStoragePath(path: string) {
    return path.split("/").map(encodeURIComponent).join("/");
}

async function storageError(response: Response) {
    let detail = response.statusText;
    try {
        const body = await response.json() as { message?: string; error?: string; error_description?: string };
        detail = body.message || body.error_description || body.error || detail;
    } catch {
        // Keep the HTTP status text when the response is not JSON.
    }
    return `Supabase Storage request failed (${response.status}): ${detail}`;
}

export class SupabaseStorageProvider implements StorageProvider {
    private getConfig() {
        const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
        const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

        if (!url || !key) {
            throw new Error("Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
        }

        return { url, key, bucket };
    }

    private getHeaders(key: string, contentType?: string) {
        const headers: Record<string, string> = { apikey: key };

        // New sb_secret keys are API keys, not JWTs. Legacy service-role keys are JWTs.
        if (!key.startsWith("sb_secret_")) {
            headers.Authorization = `Bearer ${key}`;
        }
        if (contentType) headers["Content-Type"] = contentType;
        return headers;
    }

    async uploadFile(file: File): Promise<{ url?: string; error?: string }> {
        try {
            const { url, key, bucket } = this.getConfig();
            const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1] || "jpg";
            const objectPath = `products/${crypto.randomUUID()}-${Date.now()}.${extension}`;
            const endpoint = `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(objectPath)}`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    ...this.getHeaders(key, file.type || "application/octet-stream"),
                    "cache-control": "max-age=31536000",
                    "x-upsert": "false",
                },
                body: Buffer.from(await file.arrayBuffer()),
            });

            if (!response.ok) return { error: await storageError(response) };

            const publicUrl = `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeStoragePath(objectPath)}`;
            return { url: publicUrl };
        } catch (error) {
            console.error("Failed to upload file to Supabase Storage:", error);
            return { error: error instanceof Error ? error.message : "Failed to upload file" };
        }
    }

    async deleteFile(fileUrl: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { url, key, bucket } = this.getConfig();
            const parsedUrl = new URL(fileUrl);
            const baseUrl = new URL(url);
            const publicPrefix = `/storage/v1/object/public/${encodeURIComponent(bucket)}/`;

            if (parsedUrl.origin !== baseUrl.origin || !parsedUrl.pathname.startsWith(publicPrefix)) {
                return { success: true };
            }

            const objectPath = parsedUrl.pathname.slice(publicPrefix.length).split("/").map(decodeURIComponent).join("/");
            const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}`, {
                method: "DELETE",
                headers: this.getHeaders(key, "application/json"),
                body: JSON.stringify({ prefixes: [objectPath] }),
            });

            if (!response.ok) return { success: false, error: await storageError(response) };
            return { success: true };
        } catch (error) {
            console.error("Failed to delete file from Supabase Storage:", error);
            return { success: false, error: error instanceof Error ? error.message : "Failed to delete file" };
        }
    }
}

const hasSupabaseStorageConfig = Boolean(
    process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
);

// Local development may use disk; deployed production must use persistent object storage.
export const storage = hasSupabaseStorageConfig || process.env.NODE_ENV === "production"
    ? new SupabaseStorageProvider()
    : new LocalDiskStorageProvider();
