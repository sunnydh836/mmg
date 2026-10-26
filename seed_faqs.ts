import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newFAQs = [
    {
        question: "Do you provide mobile repairing services?",
        answer: "Yes. Mahadev Mobile Gallery & Repairing provides mobile repairing services. For a specific repair requirement, customers can contact the shop or visit the store to confirm the service available for their device.",
    },
    {
        question: "Can I sell my old mobile phone at Mahadev Mobile Gallery & Repairing?",
        answer: "Yes. Mahadev Mobile Gallery & Repairing purchases old mobile phones. The value of an old phone depends on its model, condition and other relevant factors. Please contact or visit the shop for an evaluation.",
    },
    {
        question: "Can I pre-order a mobile phone that has not launched yet?",
        answer: "Currently, Mahadev Mobile Gallery & Repairing does not offer phone pre-orders. You can contact the shop to ask about newly launched or currently available models.",
    },
    {
        question: "Can I purchase mobile phone accessories here?",
        answer: "Yes. Mobile accessories are available at Mahadev Mobile Gallery & Repairing. For availability of a particular accessory, please contact the shop or visit the store.",
    },
    {
        question: "What are the shop opening hours?",
        answer: "Mahadev Mobile Gallery & Repairing is open from 9:00 AM to 10:00 PM.",
    },
    {
        question: "How can I contact Mahadev Mobile Gallery & Repairing?",
        answer: "You can contact Mahadev Mobile Gallery & Repairing by phone or WhatsApp at:\n\n+91 84300 30076\n\nYou can also visit the shop at:\n\nWJ8W+6G8, Gagol Rd, Sector 2, MDA,\nAminagar Urf Bhurbaral, Meerut,\nUttar Pradesh 250103.",
    },
    {
        question: "Do you offer gifts with mobile purchases?",
        answer: "Gift benefits may be available with eligible mobile purchases. Gift offers can vary depending on the phone and current store offer, so please contact the shop or ask in-store for the latest gift offer.",
    }
];

async function main() {
    console.log("Starting FAQ upsert...");
    const existingFaqs = await prisma.fAQ.findMany();

    for (let i = 0; i < newFAQs.length; i++) {
        const faqData = newFAQs[i];

        // Check if the FAQ already exists by matching the question
        const existing = existingFaqs.find(f => f.question.trim().toLowerCase() === faqData.question.trim().toLowerCase());

        if (existing) {
            // Update existing FAQ to preserve ID
            await prisma.fAQ.update({
                where: { id: existing.id },
                data: {
                    answer: faqData.answer,
                    sortOrder: i + 1
                }
            });
            console.log(`Updated FAQ: ${faqData.question}`);
        } else {
            // Create new FAQ
            await prisma.fAQ.create({
                data: {
                    question: faqData.question,
                    answer: faqData.answer,
                    sortOrder: i + 1
                }
            });
            console.log(`Created FAQ: ${faqData.question}`);
        }
    }

    // Remove any FAQs that are not in the new list to ensure no duplicate or old FAQs are left behind
    const newQuestionsLower = newFAQs.map(f => f.question.trim().toLowerCase());
    const faqsToDelete = existingFaqs.filter(f => !newQuestionsLower.includes(f.question.trim().toLowerCase()));

    if (faqsToDelete.length > 0) {
        for (const toDelete of faqsToDelete) {
            await prisma.fAQ.delete({
                where: { id: toDelete.id }
            });
            console.log(`Deleted old/unrelated FAQ: ${toDelete.question}`);
        }
    }

    console.log("FAQ seeding finished.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
