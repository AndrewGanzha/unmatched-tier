import type { Metadata } from "next";
import { AppShellNav } from "@/components/app-shell-nav";
import { logoutAction } from "@/modules/auth/server/logout-action";
import { getCurrentUser } from "@/modules/auth/server/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unmatched Tier",
  description: "Админ-панель для матчей, рейтинга и турниров Unmatched.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="ru">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <AppShellNav currentUser={currentUser ? { displayName: currentUser.displayName, role: currentUser.role } : null} />
            <div className="site-header-actions">
              {currentUser ? (
                <form action={logoutAction}>
                  <button className="button secondary" type="submit">
                    Logout
                  </button>
                </form>
              ) : (
                <a className="button secondary" href="/login">
                  Login
                </a>
              )}
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
