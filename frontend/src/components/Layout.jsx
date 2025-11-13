import TopNav from "./TopNav";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 px-8 py-10 max-w-6xl mx-auto w-full">
        {children}
      </main>

      <footer className="w-full text-center py-6 text-gray-400 text-sm">
        © 2025 Pathways. All rights reserved.
      </footer>
    </div>
  );
}
