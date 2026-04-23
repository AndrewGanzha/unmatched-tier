import { notFound } from "next/navigation";
import { assignHeroesAction } from "@/modules/matches/server/assign-heroes-action";
import { getCurrentUser } from "@/modules/auth/server/session";
import { getMatchDetail } from "@/modules/matches/server/get-match-detail";
import { markMatchReadyAction } from "@/modules/matches/server/mark-match-ready-action";
import { recordMatchResultAction } from "@/modules/matches/server/record-match-result-action";

const matchErrorMessages: Record<string, string> = {
  match_not_found: "Матч не найден.",
  match_not_draft: "Матч уже вышел из черновика. Автоназначение героев больше недоступно.",
  incomplete_match_sides: "Матч заполнен не полностью. Сначала проверь состав сторон.",
  rule_config_not_found: "Для такой разницы рейтинга не найдено активное правило назначения героев.",
  heroes_pool_empty: "Для одной из сторон не нашлось доступных героев по текущим правилам.",
  heroes_already_assigned: "Герои уже назначены. Повторное автоназначение заблокировано.",
  invalid_assign_payload: "Не удалось назначить героев из-за некорректных данных формы.",
  heroes_not_assigned: "Сначала назначь героев всем игрокам.",
  invalid_ready_payload: "Не удалось перевести матч в READY из-за некорректных данных формы.",
  invalid_result_payload: "Не удалось записать результат из-за некорректных данных формы.",
  match_not_ready: "Результат можно записать только для матча в статусе READY.",
  result_already_recorded: "Результат этого матча уже записан.",
  unsupported_match_shape: "Этот матч имеет неподдерживаемую структуру сторон.",
  winning_side_invalid: "Выбранная победившая сторона не принадлежит этому матчу.",
};

type MatchDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MatchDetailsPage({ params, searchParams }: MatchDetailsPageProps) {
  const currentUser = await getCurrentUser();
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const created = resolvedSearchParams.created;
  const assigned = resolvedSearchParams.assigned;
  const ready = resolvedSearchParams.ready;
  const rated = resolvedSearchParams.rated;
  const error = resolvedSearchParams.error;
  const match = await getMatchDetail(id);

  if (!match) {
    notFound();
  }

  const nextStepMessage = match.canRecordResult
    ? "Следующий шаг: выбрать победившую сторону и зафиксировать результат."
    : match.canMarkReady
      ? "Следующий шаг: перевести матч в READY после проверки назначенных героев."
      : match.canAssignHeroes
        ? "Следующий шаг: автоматически назначить героев по текущим правилам."
        : match.status === "RATED"
          ? "Матч завершён. Рейтинг уже пересчитан и сохранён в истории."
          : "Проверь текущий статус матча и состав сторон.";

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Match Details</span>
        <h1>
          Матч {match.mode} в статусе {match.status}.
        </h1>
      </section>

      <section className="section">
        {created ? <p className="status-note">Матч успешно создан.</p> : null}
        {assigned ? <p className="status-note">Герои успешно назначены автоматически.</p> : null}
        {ready ? <p className="status-note">Матч переведён в статус READY.</p> : null}
        {rated ? <p className="status-note">Результат зафиксирован, рейтинг пересчитан.</p> : null}
        {error ? <p className="status-note">Операция не выполнена: {matchErrorMessages[String(error)] ?? String(error)}.</p> : null}
        <p className="status-note">{nextStepMessage}</p>
        <div className="hero-actions">
          {currentUser?.role === "ADMIN" && match.canAssignHeroes ? (
            <form action={assignHeroesAction}>
              <input type="hidden" name="matchId" value={match.id} />
              <button className="button primary" type="submit">
                Assign heroes
              </button>
            </form>
          ) : null}
          {currentUser?.role === "ADMIN" && match.canMarkReady ? (
            <form action={markMatchReadyAction}>
              <input type="hidden" name="matchId" value={match.id} />
              <button className="button secondary" type="submit">
                Mark ready
              </button>
            </form>
          ) : null}
        </div>
        {currentUser?.role === "ADMIN" && match.canRecordResult ? (
          <form action={recordMatchResultAction} className="form-card section">
            <input type="hidden" name="matchId" value={match.id} />
            <div className="form-grid">
              <div className="form-row full">
                <label className="form-label" htmlFor="winningSideId">
                  Winning side
                </label>
                <select className="select" id="winningSideId" name="winningSideId" required defaultValue="">
                  <option value="">Выбери победителя</option>
                  {match.sides.map((side) => (
                    <option key={side.id} value={side.id}>
                      Сторона {side.sideIndex}: {side.name || "Без названия"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row full">
                <button className="button primary" type="submit">
                  Record result and rate match
                </button>
              </div>
            </div>
          </form>
        ) : null}
        <div className="grid">
          <article className="card">
            <h3>Служебные данные</h3>
            <p>ID: {match.id}</p>
            <p>Создан: {new Date(match.createdAt).toLocaleString("ru-RU")}</p>
            <p>Автор: {match.createdBy}</p>
            <p>Notes: {match.notes || "нет"}</p>
            <p>Result: {match.result ? `winner side ${match.result.winningSideId}` : "not recorded"}</p>
          </article>
          {match.sides.map((side) => (
            <article className="card" key={side.id}>
              <h3>
                Сторона {side.sideIndex}: {side.name || "Без названия"}
              </h3>
              <p>Seed rating: {side.seedRating}</p>
              <p>{side.isWinner ? "Победитель" : "Не победитель"}</p>
              <ul>
                {side.players.map((player) => (
                  <li key={player.id}>
                    {player.displayName} · стартовый рейтинг {player.ratingBefore}
                    {player.hero ? ` · герой ${player.hero.name}` : " · герой еще не назначен"}
                    {player.ratingAfter !== null ? ` · итог ${player.ratingAfter}` : ""}
                    {player.ratingDelta !== null ? ` · delta ${player.ratingDelta}` : ""}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
