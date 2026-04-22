import { createPlayerAction } from "@/modules/players/server/create-player-action";
import { getCurrentUser } from "@/modules/auth/server/session";
import { getPlayers } from "@/modules/players/server/get-players";

type PlayersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const currentUser = await getCurrentUser();
  const players = await getPlayers();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const created = resolvedSearchParams.created;
  const error = resolvedSearchParams.error;

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Players</span>
        <h1>Игроки, которые участвуют в рейтинговых матчах и турнирах.</h1>
        <p>
          Уже доступен первый write-flow: создается учетная запись пользователя и связанный
          игровой профиль с общим рейтингом.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Создать игрока</h2>
        {created ? <p className="status-note">Игрок успешно создан.</p> : null}
        {error ? <p className="status-note">Не удалось создать игрока: {String(error)}.</p> : null}
        {currentUser?.role === "ADMIN" ? (
          <form action={createPlayerAction} className="form-card">
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label" htmlFor="displayName">
                  Display name
                </label>
                <input className="input" id="displayName" name="displayName" required minLength={2} />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input className="input" id="email" name="email" type="email" required />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input className="input" id="password" name="password" type="password" required minLength={6} />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="role">
                  Role
                </label>
                <select className="select" id="role" name="role" defaultValue="PLAYER">
                  <option value="PLAYER">Player</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-row full">
                <button className="button primary" type="submit">
                  Создать игрока
                </button>
              </div>
            </div>
          </form>
        ) : (
          <article className="card">
            <h3>Нужен доступ администратора</h3>
            <p>Создание игроков доступно только после входа под пользователем с ролью ADMIN.</p>
          </article>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Текущий список</h2>
        <div className="list-stack">
          {players.length === 0 ? (
            <article className="card">
              <h3>Игроков пока нет</h3>
              <p>Создай первого игрока через форму выше.</p>
            </article>
          ) : (
            players.map((player) => (
              <article className="card" key={player.id}>
                <div className="inline-meta">
                  <span className="pill">{player.role}</span>
                  <span>{player.email}</span>
                </div>
                <h3>
                  <a href={`/players/${player.id}`}>{player.displayName}</a>
                </h3>
                <p>
                  Рейтинг: <strong>{player.rating}</strong>
                </p>
                <p>
                  Победы {player.wins} · Поражения {player.losses} · Матчи {player.matchesPlayed}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
