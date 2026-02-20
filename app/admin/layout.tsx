import { AdminLoginCheck } from './login-check';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLoginCheck>{children}</AdminLoginCheck>;
}
