import AdminGuard from "@/components/admin/AdminGuard";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";

export const metadata = {
  title: "Admin Dashboard | BidAgri",
  description: "Monitor buyer leads, support requests, and marketplace coverage.",
};

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
