import { Toaster } from '@/components/ui/toaster';
import { UseQueryResult } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export interface IRouterContext {
  auth: UseQueryResult<string, Error>
}

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <main>
      <Outlet />
      <Toaster />
      {/* <TanStackRouterDevtools position='bottom-right' /> */}
    </main>
  );
}