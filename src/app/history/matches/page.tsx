import Link from "next/link";
import { getMatchHistory } from "@/modules/matches/server/get-match-history";

export default async function MatchHistoryPage() {
  const matches = await getMatchHistory();

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Match History</span>
        <h1>Журнал сыгранных матчей.</h1>
      </section>

      <section className="section">
        <h2 className="section-title">Последние матчи</h2>
        <div className="list-stack">
          {matches.length === 0 ? (
            <article className="card">
              <h3>Матчей пока нет</h3>
              <p>После первого сохранённого результата здесь появится история матчей.</p>
            </article>
          ) : (
            matches.map((match) => (
              <article className="card" key={match.id}>
                <div className="inline-meta">
                  <span className="pill">{match.mode}</span>
                  <span>{match.status}</span>
                  <span>{new Date(match.createdAt).toLocaleString("ru-RU")}</span>
                </div>
                <h3>
                  <Link href={`/matches/${match.id}`}>Матч {match.id}</Link>
                </h3>
                <ul>
                  {match.sides.map((side) => (
                    <li key={side.id}>
                      Сторона {side.sideIndex}:{" "}
                      {side.players
                        .map((player) =>
                          `${player.displayName}${player.hero ? ` (${player.hero.name})` : ""}${
                            player.ratingDelta !== null
                              ? ` [${player.ratingDelta > 0 ? "+" : ""}${player.ratingDelta}]`
                              : ""
                          }`,
                        )
                        .join(", ")}
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
