import { Sidebar } from "@/components/Sidebar"

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-64 w-full min-h-screen bg-gradient-to-b from-zinc-800 to-black">
                {children}
            </div>
        </div>
    );
} 