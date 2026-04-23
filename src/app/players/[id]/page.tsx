import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/server/session";
import { getPlayerDetail } from "@/modules/players/server/get-player-detail";
import { updatePlayerRatingAction } from "@/modules/players/server/update-player-rating-action";

type PlayerDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const playerStatusMessages: Record<string, string> = {
  invalid_rating_payload: "Не удалось обновить рейтинг из-за некорректных данных.",
  player_not_found: "Игрок не найден.",
};

export default async function PlayerDetailsPage({ params, searchParams }: PlayerDetailsPageProps) {
  const currentUser = await getCurrentUser();
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const ratingUpdated = resolvedSearchParams.rating_updated;
  const error = resolvedSearchParams.error;
  const player = await getPlayerDetail(id);

  if (!player) {
    notFound();
  }

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Player Profile</span>
        <h1>{player.displayName}</h1>
      </section>

      <section className="section">
        <h2 className="section-title">Профиль</h2>
        {ratingUpdated ? <p className="status-note">Рейтинг игрока обновлён.</p> : null}
        {error ? <p className="status-note">Операция не выполнена: {playerStatusMessages[String(error)] ?? String(error)}.</p> : null}
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
          {currentUser?.role === "ADMIN" ? (
            <form action={updatePlayerRatingAction} className="form-card">
              <input type="hidden" name="playerId" value={player.id} />
              <div className="form-grid">
                <div className="form-row full">
                  <h3>Редактировать рейтинг</h3>
                  <p className="field-hint">Изменяет только текущее значение рейтинга в профиле игрока.</p>
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor="rating">
                    Rating
                  </label>
                  <input
                    className="input"
                    id="rating"
                    name="rating"
                    type="number"
                    min={0}
                    max={5000}
                    defaultValue={player.rating}
                    required
                  />
                </div>
                <div className="form-row full">
                  <button className="button primary" type="submit">
                    Обновить рейтинг
                  </button>
                </div>
              </div>
            </form>
          ) : null}
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
                  <Link href={`/matches/${match.id}`}>Матч {match.id}</Link>
                </h3>
                <p>
                  Против: {match.opponents.join(", ") || "нет соперника"} · {match.isWinner ? "победа" : "поражение или матч не завершён"}
                </p>
                <p>Герой: {match.hero ? `${match.hero.name} (${match.hero.tier})` : "не назначен"}</p>
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
                      <Link href={`/matches/${event.matchId}`}>{event.matchId}</Link>
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
