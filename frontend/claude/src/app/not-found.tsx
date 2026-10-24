import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-serif text-4xl text-ink">Page not found</h1>
      <Link href="/" className="text-sm text-primary underline underline-offset-4">
        Back to Attires Arena
      </Link>
    </main>
  );
}
