import { MatchMode } from "@prisma/client";
import { getCurrentUser } from "@/modules/auth/server/session";
import { createMatchAction } from "@/modules/matches/server/create-match-action";
import { getPlayers } from "@/modules/players/server/get-players";

const errorMessages: Record<string, string> = {
  invalid_match_payload: "Проверь состав матча и попробуй снова.",
  duplicate_players: "Нельзя выбрать одного и того же игрока дважды в одном матче.",
  players_not_available: "Один или несколько выбранных игроков недоступны для матча.",
  match_not_found: "Матч не найден.",
  invalid_assign_payload: "Некорректные данные формы.",
};

type NewMatchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function PlayerOptions({ players }: { players: Array<{ id: string; displayName: string; rating: number }> }) {
  return (
    <>
      <option value="">Выбери игрока</option>
      {players.map((player) => (
        <option key={player.id} value={player.id}>
          {player.displayName} · {player.rating}
        </option>
      ))}
    </>
  );
}

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
        <h1>Создание черновика матча 1v1 или 2v2.</h1>
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
          <div className="grid">
            <form action={createMatchAction} className="form-card">
              <input type="hidden" name="mode" value={MatchMode.ONE_VS_ONE} />
              <div className="form-grid">
                <div className="form-row full">
                  <h3>Матч 1v1</h3>
                  <p className="field-hint">По одному игроку на сторону.</p>
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor="leftPlayerId1v1">
                    Player 1
                  </label>
                  <select className="select" id="leftPlayerId1v1" name="leftPlayerId" required defaultValue="">
                    <PlayerOptions players={availablePlayers} />
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor="rightPlayerId1v1">
                    Player 2
                  </label>
                  <select className="select" id="rightPlayerId1v1" name="rightPlayerId" required defaultValue="">
                    <PlayerOptions players={availablePlayers} />
                  </select>
                </div>
                <div className="form-row full">
                  <label className="form-label" htmlFor="notes1v1">
                    Notes
                  </label>
                  <input className="input" id="notes1v1" name="notes" placeholder="Например: вечерняя серия bo3" />
                </div>
                <div className="form-row full">
                  <button className="button primary" type="submit">
                    Создать матч 1v1
                  </button>
                </div>
              </div>
            </form>

            {availablePlayers.length < 4 ? (
              <article className="card">
                <h3>Матч 2v2 пока недоступен</h3>
                <p>Для режима 2v2 нужны минимум четыре активных игрока.</p>
              </article>
            ) : (
              <form action={createMatchAction} className="form-card">
                <input type="hidden" name="mode" value={MatchMode.TWO_VS_TWO} />
                <div className="form-grid">
                  <div className="form-row full">
                    <h3>Матч 2v2</h3>
                    <p className="field-hint">По два игрока на сторону. Все четыре игрока должны быть разными.</p>
                  </div>
                  <div className="form-row">
                    <label className="form-label" htmlFor="leftPlayerId2v2">
                      Team 1 · Player 1
                    </label>
                    <select className="select" id="leftPlayerId2v2" name="leftPlayerId" required defaultValue="">
                      <PlayerOptions players={availablePlayers} />
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label" htmlFor="leftTeammateId2v2">
                      Team 1 · Player 2
                    </label>
                    <select className="select" id="leftTeammateId2v2" name="leftTeammateId" required defaultValue="">
                      <PlayerOptions players={availablePlayers} />
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label" htmlFor="rightPlayerId2v2">
                      Team 2 · Player 1
                    </label>
                    <select className="select" id="rightPlayerId2v2" name="rightPlayerId" required defaultValue="">
                      <PlayerOptions players={availablePlayers} />
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label" htmlFor="rightTeammateId2v2">
                      Team 2 · Player 2
                    </label>
                    <select className="select" id="rightTeammateId2v2" name="rightTeammateId" required defaultValue="">
                      <PlayerOptions players={availablePlayers} />
                    </select>
                  </div>
                  <div className="form-row full">
                    <label className="form-label" htmlFor="notes2v2">
                      Notes
                    </label>
                    <input className="input" id="notes2v2" name="notes" placeholder="Например: командная серия bo3" />
                    <p className="field-hint">В список попадают только активные игроки.</p>
                  </div>
                  <div className="form-row full">
                    <button className="button primary" type="submit">
                      Создать матч 2v2
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
