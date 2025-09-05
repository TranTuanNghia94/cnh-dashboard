import { useAuthQuery } from '@/hooks/use-auth';
import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const auth = useAuthQuery();


  if (!auth.data) {
    return <Navigate to='/login' />;
  }

  return <Navigate to='/home' />;
}