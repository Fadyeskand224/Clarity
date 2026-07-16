import BottomNav from './BottomNav';

export default function AppShell({ children }) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-page">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
