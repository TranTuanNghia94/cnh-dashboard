import { isAuthenticated } from '@/lib/auth-guard';
import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return <Navigate to="/home" />;
}