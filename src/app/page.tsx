import Link from "next/link";
import { getDashboardSummary } from "@/modules/dashboard/server/get-dashboard-summary";

const firstModules = [
  {
    title: "Players",
    description: "Игроки, рейтинги и краткая история матчей.",
  },
  {
    title: "Heroes",
    description: "Каталог персонажей с tier, типом боя и power score.",
  },
  {
    title: "Matches",
    description: "Матчи, стороны, результаты и фиксация победителя.",
  },
];

export default async function HomePage() {
  const summary = await getDashboardSummary();

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Operations Dashboard</span>
        <h1>Панель управления матчами, игроками и каталогом Unmatched.</h1>
        <div className="hero-actions">
          <Link className="button primary" href="/matches/new">
            Create 1v1 Match
          </Link>
          <Link className="button secondary" href="/leaderboard">
            Open Leaderboard
          </Link>
          <Link className="button secondary" href="/players">
            Manage Players
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">System State</h2>
          <Link className="section-link" href="/matches/new">
            Быстро создать матч
          </Link>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">PLAYERS</span>
            <strong>{summary.stats.playerCount}</strong>
            <p>Игроков в системе</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">ACTIVE HEROES</span>
            <strong>{summary.stats.activeHeroCount}</strong>
            <p>Доступных персонажей</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">MATCHES</span>
            <strong>{summary.stats.matchCount}</strong>
            <p>Матчей записано</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">TOURNAMENTS</span>
            <strong>{summary.stats.tournamentCount}</strong>
            <p>Турнирных сущностей</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="grid">
          {firstModules.map((module) => (
            <article className="card" key={module.title}>
              <span className="pill">{module.title.toUpperCase()}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          <Link className="section-link" href="/history/matches">
            View all matches
          </Link>
        </div>
        <div className="grid">
          {summary.latestMatches.length === 0 ? (
            <article className="card">
              <h3>No Recent Matches</h3>
              <p>После первого завершённого матча здесь появится оперативная лента встреч.</p>
            </article>
          ) : (
            summary.latestMatches.map((match) => (
              <article className="match-card" key={match.id}>
                <div className="inline-meta">
                  <span className="pill">{match.mode}</span>
                  <span>{match.status}</span>
                  <span>{new Date(match.createdAt).toLocaleString("ru-RU")}</span>
                </div>
                <h3>Match {match.id}</h3>
                <ul>
                  {match.sides.map((side) => (
                    <li key={side.id}>
                      Сторона {side.sideIndex}: {side.players.join(", ") || "нет игроков"}
                      {side.isWinner ? " · победитель" : ""}
                    </li>
                  ))}
                </ul>
                <Link className="section-link" href={`/matches/${match.id}`}>
                  Open match
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
