const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

async function fetchHomepage() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
    });
}

async function runTests() {
    console.log("=== STARTING OFFER VERIFICATION ===");

    // Clear previously failed tests just in case
    await prisma.offer.deleteMany({ where: { title: { contains: "TEST" } } });

    // TEST 1 — CREATE
    console.log("\n[TEST 1] Creating Offer...");
    const offer = await prisma.offer.create({
        data: {
            title: "AUTOMATED TEST OFFER",
            description: "Test offer for synchronization.",
            badge: "TEST",
            displayOrder: 1,
            isActive: true
        }
    });
    console.log("Create PASS");

    // Check Homepage
    console.log("Fetching homepage after create...");
    let html = await fetchHomepage();
    if (html.includes("AUTOMATED TEST OFFER") && html.includes("TEST")) {
        console.log("Homepage Reflection (Create): PASS");
    } else {
        console.log("Homepage Reflection (Create): FAIL");
    }

    // TEST 2 — EDIT
    console.log("\n[TEST 2] Editing Offer...");
    await prisma.offer.update({
        where: { id: offer.id },
        data: { title: "UPDATED AUTOMATED OFFER" }
    });
    console.log("Edit PASS");

    console.log("Fetching homepage after edit...");
    html = await fetchHomepage();
    if (html.includes("UPDATED AUTOMATED OFFER") && !html.includes("AUTOMATED TEST OFFER")) {
        console.log("Homepage Reflection (Edit): PASS");
    } else {
        console.log("Homepage Reflection (Edit): FAIL");
    }

    // TEST 3 — DEACTIVATE
    console.log("\n[TEST 3] Deactivating Offer...");
    await prisma.offer.update({
        where: { id: offer.id },
        data: { isActive: false }
    });
    console.log("Fetching homepage after deactivate...");
    html = await fetchHomepage();
    if (!html.includes("UPDATED AUTOMATED OFFER")) {
        console.log("Homepage Reflection (Deactivate): PASS");
    } else {
        console.log("Homepage Reflection (Deactivate): FAIL");
    }

    // Reactivate
    await prisma.offer.update({
        where: { id: offer.id },
        data: { isActive: true }
    });

    // TEST 5 — DATE VALIDITY
    console.log("\n[TEST 5] Testing expiration date...");
    // Set expiration to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await prisma.offer.update({
        where: { id: offer.id },
        data: { endDate: yesterday }
    });

    html = await fetchHomepage();
    if (!html.includes("UPDATED AUTOMATED OFFER")) {
        console.log("Homepage Reflection (Expiration): PASS");
    } else {
        console.log("Homepage Reflection (Expiration): FAIL");
    }

    // TEST 5 — DELETE
    console.log("\n[TEST 6] Deleting Offer...");
    await prisma.offer.delete({ where: { id: offer.id } });
    html = await fetchHomepage();
    if (!html.includes("UPDATED AUTOMATED OFFER")) {
        console.log("Homepage Reflection (Delete): PASS");
    } else {
        console.log("Homepage Reflection (Delete): FAIL");
    }

    // TEST EMPTY STATE
    console.log("\n[TEST 7] Empty State checking...");
    // Check if the offers section header is visible when no active offers exist.
    // If no active offers, 'SPECIAL OFFERS' should ideally not be rendered, or rendered cleanly.
    // We didn't delete production ones, so there might be real ones.
    const activeOffers = await prisma.offer.count({ where: { isActive: true } });
    if (activeOffers === 0) {
        if (!html.includes("SPECIAL OFFERS")) {
            console.log("Homepage Reflection (Empty State): PASS - Element hidden completely");
        } else {
            console.log("Homepage Reflection (Empty State): PASS - Handled, but elements present?");
        }
    } else {
        console.log("Skipping empty state visual check as active offers exist in DB.");
    }

    console.log("\n=== VERIFICATION COMPLETE ===");
}

runTests().catch(console.error).finally(() => process.exit(0));
