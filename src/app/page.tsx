import Link from "next/link";
import { getDashboardSummary } from "@/modules/dashboard/server/get-dashboard-summary";

const buildSteps = [
  "Настроить Prisma client и первую миграцию SQLite.",
  "Добавить auth-flow и роли admin/player.",
  "Собрать вертикальный срез матча 1v1 с автоназначением героев.",
];

const firstModules = [
  {
    title: "Players",
    description: "Профили игроков, общий рейтинг, история матчей и рейтинг-событий.",
  },
  {
    title: "Heroes",
    description: "Каталог персонажей с tier, power_score и флагами доступности.",
  },
  {
    title: "Matches",
    description: "Матчи 1v1 и 2v2, стороны, участники, результаты и фиксация победителя.",
  },
];

export default async function HomePage() {
  const summary = await getDashboardSummary();

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Operations Dashboard</span>
        <h1>Рейтинговая панель для матчей, игроков и турниров Unmatched.</h1>
        <p>
          Интерфейс переведен в более соревновательный dashboard-стиль: темная операционная
          панель, быстрые действия, рейтинг, история матчей и рабочие админские сценарии в
          одном приложении.
        </p>
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
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid">
          {buildSteps.map((step, index) => (
            <article className="action-card" key={step}>
              <div className="action-icon">{index + 1}</div>
              <div>
                <h3>Action {index + 1}</h3>
                <p>{step}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">System State</h2>
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
        <h2 className="section-title">Modules</h2>
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
          <a className="section-link" href="/history/matches">
            View all matches
          </a>
        </div>
        <div className="grid">
          {summary.latestMatches.length === 0 ? (
            <article className="card">
              <h3>No Recent Matches</h3>
              <p>После первого завершенного матча здесь появится оперативная лента встреч.</p>
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
