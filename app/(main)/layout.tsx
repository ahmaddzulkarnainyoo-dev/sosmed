import TopNavbar from "@/components/TopNavbar";
import BottomNavWithPost from '@/components/BottomNavWithPost';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <main className="max-w-2xl mx-auto px-4 pb-20 md:pb-6">
        {children}
      </main>
      <BottomNavWithPost />
    </div>
  );
}