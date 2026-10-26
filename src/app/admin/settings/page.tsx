export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import AccountSecurityForm from "./AccountSecurityForm";

export default async function SettingsPage() {
    const settings = await prisma.storeSettings.findUnique({
        where: { id: 1 },
    }) || await prisma.storeSettings.create({ data: { id: 1 } });

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12">
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Store Settings</h1>
                    <p className="text-neutral-400">Manage business details, operating hours, and business rules.</p>
                </div>
                <SettingsForm initialData={settings} />
            </div>

            <div>
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Account & Security</h2>
                    <p className="text-neutral-400">Manage admin credentials, recovery email, and trusted devices.</p>
                </div>
                <AccountSecurityForm />
            </div>
        </div>
    );
}


