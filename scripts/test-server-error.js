import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const pagePath = path.join(process.cwd(), 'src/app/(public)/page.tsx');
let original = fs.readFileSync(pagePath, 'utf-8');

// Inject error in OffersBoundary
let modified = original.replace(
    'async function OffersBoundary({ settings }: { settings: any }) {',
    'async function OffersBoundary({ settings }: { settings: any }) {\n  throw new Error("TEST_OFFERS_SERVER_ERROR");'
);

fs.writeFileSync(pagePath, modified);
console.log('Injected TEST_OFFERS_SERVER_ERROR in OffersBoundary');
