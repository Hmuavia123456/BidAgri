
export const metadata = {
  title: "Admin | BidAgri",
  description: "Administrative control center for BidAgri.",
};

export default function AdminLayout({ children }) {
  return (
    <div className="relative min-h-[calc(100vh-72px)] bg-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.08)] via-white to-white" aria-hidden="true" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 md:px-8">
        {children}
      </div>
    </div>
  );
}
