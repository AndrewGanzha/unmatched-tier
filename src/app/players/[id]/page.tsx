import { notFound } from "next/navigation";
import { getPlayerDetail } from "@/modules/players/server/get-player-detail";

type PlayerDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerDetailsPage({ params }: PlayerDetailsPageProps) {
  const { id } = await params;
  const player = await getPlayerDetail(id);

  if (!player) {
    notFound();
  }

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Player Profile</span>
        <h1>{player.displayName}</h1>
        <p>
          Карточка игрока с текущим рейтингом, историей матчей и журналом изменений рейтинга.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Профиль</h2>
        <div className="meta">
          <article className="card">
            <strong>{player.rating}</strong>
            <p>Текущий рейтинг</p>
          </article>
          <article className="card">
            <strong>{player.wins}</strong>
            <p>Победы</p>
          </article>
          <article className="card">
            <strong>{player.losses}</strong>
            <p>Поражения</p>
          </article>
        </div>
        <div className="grid">
          <article className="card">
            <h3>Служебные данные</h3>
            <p>Email: {player.email}</p>
            <p>Role: {player.role}</p>
            <p>Матчи: {player.matchesPlayed}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Последние матчи</h2>
        <div className="list-stack">
          {player.recentMatches.length === 0 ? (
            <article className="card">
              <h3>История пуста</h3>
              <p>У игрока пока нет сыгранных или созданных матчей.</p>
            </article>
          ) : (
            player.recentMatches.map((match) => (
              <article className="card" key={match.id}>
                <div className="inline-meta">
                  <span className="pill">{match.mode}</span>
                  <span>{match.status}</span>
                  <span>{new Date(match.createdAt).toLocaleString("ru-RU")}</span>
                </div>
                <h3>
                  <a href={`/matches/${match.id}`}>Матч {match.id}</a>
                </h3>
                <p>
                  Против: {match.opponents.join(", ") || "нет соперника"} ·{" "}
                  {match.isWinner ? "победа" : "поражение или матч не завершен"}
                </p>
                <p>
                  Герой: {match.hero ? `${match.hero.name} (${match.hero.tier})` : "не назначен"}
                </p>
                <p>
                  Рейтинг: {match.ratingBefore}
                  {match.ratingAfter !== null ? ` -> ${match.ratingAfter}` : ""}
                  {match.ratingDelta !== null ? ` (${match.ratingDelta > 0 ? "+" : ""}${match.ratingDelta})` : ""}
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Журнал рейтинга</h2>
        <div className="table-card">
          {player.ratingHistory.length === 0 ? (
            <p className="empty-state">Рейтинг еще ни разу не менялся.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Матч</th>
                  <th>До</th>
                  <th>После</th>
                  <th>Delta</th>
                </tr>
              </thead>
              <tbody>
                {player.ratingHistory.map((event) => (
                  <tr key={event.id}>
                    <td>{new Date(event.createdAt).toLocaleString("ru-RU")}</td>
                    <td>
                      <a href={`/matches/${event.matchId}`}>{event.matchId}</a>
                    </td>
                    <td>{event.ratingBefore}</td>
                    <td>{event.ratingAfter}</td>
                    <td>{event.delta > 0 ? `+${event.delta}` : event.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

