export type ProductType = 'NEW' | 'USED' | 'REFURBISHED';
export type ProductCategory = 'Smartphones' | 'Accessories';
export type ProductAvailability = 'In Stock' | 'Out of Stock' | 'Limited Stock';
export type ProductBrand = 'Apple' | 'Samsung' | 'OnePlus' | 'Oppo' | 'Vivo' | 'Realme' | 'Redmi' | 'Other';

export interface Product {
    id: string;
    slug: string;
    name: string;
    brand: ProductBrand;
    category: ProductCategory;
    type: ProductType;
    price: number | null;
    mrp?: number | null;
    description: string;
    shortDescription: string;
    images: string[];
    specifications: Record<string, string>;
    availability: ProductAvailability;
    featured: boolean;
    createdAt: string;
    updatedAt: string;

    // Legacy mapping properties for compatibility with original design
    imagePlaceholderId: number;
    isDemo?: boolean;
    preOwnedCondition?: string; // "Like New", "Excellent", "Good"
}
