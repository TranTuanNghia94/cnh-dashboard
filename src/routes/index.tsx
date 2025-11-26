
import { getCookie, SUB } from '@/lib/cookie';
import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const user = getCookie(SUB)



  if (!user || user === undefined) {
    return <Navigate to='/login' />;
  }

  return <Navigate to='/home' />;
}