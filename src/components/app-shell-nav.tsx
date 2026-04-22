"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellNavProps = {
  currentUser:
    | {
        displayName: string;
        role: string;
      }
    | null;
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/players", label: "Players" },
  { href: "/heroes", label: "Heroes" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/history/matches", label: "History" },
  { href: "/matches/new", label: "New Match" },
];

export function AppShellNav({ currentUser }: AppShellNavProps) {
  const pathname = usePathname();

  return (
    <div className="site-header-inner">
      <div className="site-brand-block">
        <Link className="site-brand" href="/">
          Unmatched Tier
        </Link>
        <p className="site-brand-subtitle">Competitive match operations panel</p>
      </div>

      <nav className="site-nav" aria-label="Основная навигация">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "site-nav-link is-active" : "site-nav-link"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="site-auth">
        {currentUser ? (
          <div className="site-auth-user-block">
            <span className="site-auth-user">{currentUser.displayName}</span>
            <span className="site-auth-role">{currentUser.role}</span>
          </div>
        ) : (
          <div className="site-auth-user-block">
            <span className="site-auth-user">Guest</span>
            <span className="site-auth-role">VIEW ONLY</span>
          </div>
        )}
      </div>
    </div>
  );
}
