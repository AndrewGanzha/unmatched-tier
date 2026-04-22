import type { Metadata } from "next";
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
            <div className="site-header-inner">
              <a className="site-brand" href="/">
                Unmatched Tier
              </a>
              <nav className="site-nav" aria-label="Основная навигация">
                <a href="/">Dashboard</a>
                <a href="/players">Players</a>
                <a href="/heroes">Heroes</a>
                <a href="/leaderboard">Leaderboard</a>
                <a href="/history/matches">Match History</a>
                <a href="/matches/new">New Match</a>
              </nav>
              <div className="site-auth">
                {currentUser ? (
                  <>
                    <span className="site-auth-user">
                      {currentUser.displayName} · {currentUser.role}
                    </span>
                    <form action={logoutAction}>
                      <button className="button secondary" type="submit">
                        Logout
                      </button>
                    </form>
                  </>
                ) : (
                  <a className="button secondary" href="/login">
                    Login
                  </a>
                )}
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
