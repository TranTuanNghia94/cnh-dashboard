import { getCookie, removeAllCookies, SUB, TOKEN } from "@/lib/cookie";
import { toast } from "@/hooks/use-toast";
import { redirect } from "@tanstack/react-router";

const LOGIN_PATH = "/login";
let isRedirectingToLogin = false;

export const isAuthenticated = () => {
  const token = getCookie(TOKEN);
  const sub = getCookie(SUB);

  return Boolean(token && token.length > 0 && sub && sub.length > 0);
};

export const ensureAuthenticated = () => {
  if (!isAuthenticated()) {
    throw redirect({ to: LOGIN_PATH, replace: true });
  }
};

export const redirectToLogin = () => {
  if (isRedirectingToLogin) {
    return;
  }

  isRedirectingToLogin = true;

  removeAllCookies();
  toast({
    variant: "warning",
    title: "Phiên đăng nhập đã hết hạn",
    description: "Vui lòng đăng nhập lại để tiếp tục.",
  });

  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== LOGIN_PATH) {
    window.setTimeout(() => {
      window.location.href = LOGIN_PATH;
    }, 250);
  }
};
