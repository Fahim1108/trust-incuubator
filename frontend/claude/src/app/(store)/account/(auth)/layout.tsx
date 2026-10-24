export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex justify-center py-10 sm:py-16">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-soft sm:p-9">{children}</div>
    </div>
  );
}
