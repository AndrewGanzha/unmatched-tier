import { createMatch1v1Action } from "@/modules/matches/server/create-match-1v1-action";
import { getCurrentUser } from "@/modules/auth/server/session";
import { getPlayers } from "@/modules/players/server/get-players";

const errorMessages: Record<string, string> = {
  invalid_match_payload: "Проверь состав матча и попробуй снова.",
  duplicate_players: "Нельзя выбрать одного и того же игрока в обе стороны.",
  players_not_available: "Один или оба выбранных игрока недоступны для матча.",
  match_not_found: "Матч не найден.",
  invalid_assign_payload: "Некорректные данные формы.",
};

type NewMatchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewMatchPage({ searchParams }: NewMatchPageProps) {
  const currentUser = await getCurrentUser();
  const players = await getPlayers();
  const availablePlayers = players.filter((player) => player.isActive);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const error = resolvedSearchParams.error;

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">New Match</span>
        <h1>Создание черновика матча 1v1.</h1>
      </section>

      <section className="section">
        <h2 className="section-title">Собрать матч</h2>
        {error ? <p className="status-note">Не удалось создать матч: {errorMessages[String(error)] ?? String(error)}.</p> : null}
        {currentUser?.role !== "ADMIN" ? (
          <article className="card">
            <h3>Нужен доступ администратора</h3>
            <p>Создание матчей доступно только после входа под ADMIN.</p>
          </article>
        ) : availablePlayers.length < 2 ? (
          <article className="card">
            <h3>Недостаточно активных игроков</h3>
            <p>Для матча нужны как минимум два активных игрока со страницы Players.</p>
          </article>
        ) : (
          <form action={createMatch1v1Action} className="form-card">
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label" htmlFor="leftPlayerId">
                  Player 1
                </label>
                <select className="select" id="leftPlayerId" name="leftPlayerId" required defaultValue="">
                  <option value="">Выбери игрока</option>
                  {availablePlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.displayName} · {player.rating}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="rightPlayerId">
                  Player 2
                </label>
                <select className="select" id="rightPlayerId" name="rightPlayerId" required defaultValue="">
                  <option value="">Выбери игрока</option>
                  {availablePlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.displayName} · {player.rating}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row full">
                <label className="form-label" htmlFor="notes">
                  Notes
                </label>
                <input className="input" id="notes" name="notes" placeholder="Например: вечерняя серия bo3" />
                <p className="field-hint">В список попадают только активные игроки.</p>
              </div>
              <div className="form-row full">
                <button className="button primary" type="submit">
                  Создать матч 1v1
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
