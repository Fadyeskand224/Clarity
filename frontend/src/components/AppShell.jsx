import BottomNav from './BottomNav';
import ProfileButton from './ProfileButton';

export default function AppShell({ children }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-full max-w-md flex-col">
      <ProfileButton />
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
