import { getLeaderboard } from "@/modules/leaderboard/server/get-leaderboard";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Leaderboard</span>
        <h1>Текущий рейтинг игроков.</h1>
      </section>

      <section className="section">
        <h2 className="section-title">Текущий топ</h2>
        <div className="table-card">
          {leaderboard.length === 0 ? (
            <p className="empty-state">Пока нет игроков. Создай первого пользователя в разделе Players или через seed.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Место</th>
                  <th>Игрок</th>
                  <th>Рейтинг</th>
                  <th>Победы</th>
                  <th>Поражения</th>
                  <th>Матчи</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player) => (
                  <tr key={player.id}>
                    <td>{player.rank}</td>
                    <td>{player.displayName}</td>
                    <td>{player.rating}</td>
                    <td>{player.wins}</td>
                    <td>{player.losses}</td>
                    <td>{player.matchesPlayed}</td>
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
