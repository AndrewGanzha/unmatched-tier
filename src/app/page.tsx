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
        <span className="eyebrow">Unmatched Admin Panel</span>
        <h1>Рейтинг, матчи и турниры в одном Next.js приложении.</h1>
        <p>
          Стартовый каркас поднят без отдельного backend-сервиса. Вся серверная логика
          будет жить в Next.js поверх Prisma и SQLite, а позже без перелома модели сможет
          перейти на PostgreSQL.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="/api/health">
            Проверить API
          </a>
          <a className="button secondary" href="/leaderboard">
            Открыть рейтинг
          </a>
          <a className="button secondary" href="/players">
            Открыть игроков
          </a>
          <a className="button secondary" href="/heroes">
            Открыть героев
          </a>
          <a className="button secondary" href="/matches/new">
            Создать матч
          </a>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Ближайшие шаги</h2>
        <div className="grid">
          {buildSteps.map((step, index) => (
            <article className="card" key={step}>
              <h3>Шаг {index + 1}</h3>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Первые модули</h2>
        <div className="grid">
          {firstModules.map((module) => (
            <article className="card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Текущее состояние</h2>
        <div className="meta">
          <article className="card">
            <strong>{summary.stats.playerCount}</strong>
            <p>Игроков в системе.</p>
          </article>
          <article className="card">
            <strong>{summary.stats.activeHeroCount}</strong>
            <p>Активных персонажей в каталоге.</p>
          </article>
          <article className="card">
            <strong>{summary.stats.matchCount}</strong>
            <p>Матчей уже записано в базе.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Последние матчи</h2>
        <div className="grid">
          {summary.latestMatches.length === 0 ? (
            <article className="card">
              <h3>Пока пусто</h3>
              <p>После первого завершенного матча здесь появится история последних встреч.</p>
            </article>
          ) : (
            summary.latestMatches.map((match) => (
              <article className="card" key={match.id}>
                <h3>
                  {match.mode} · {match.status}
                </h3>
                <p>{new Date(match.createdAt).toLocaleString("ru-RU")}</p>
                <ul>
                  {match.sides.map((side) => (
                    <li key={side.id}>
                      Сторона {side.sideIndex}: {side.players.join(", ") || "нет игроков"}
                      {side.isWinner ? " · победитель" : ""}
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
