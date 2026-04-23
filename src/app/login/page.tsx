import { loginAction } from "@/modules/auth/server/login-action";
import { getCurrentUser } from "@/modules/auth/server/session";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const error = resolvedSearchParams.error;
  const loggedOut = resolvedSearchParams.logged_out;

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Login</span>
        <h1>Вход в административную панель.</h1>
      </section>

      <section className="section">
        {loggedOut ? <p className="status-note">Сессия завершена.</p> : null}
        {error ? <p className="status-note">Ошибка входа: {String(error)}.</p> : null}
        {user ? (
          <article className="card">
            <h3>Сессия уже открыта</h3>
            <p>
              Текущий пользователь: {user.displayName} · {user.role}
            </p>
          </article>
        ) : (
          <form action={loginAction} className="form-card">
            <div className="form-grid">
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
                <input className="input" id="password" name="password" type="password" required />
              </div>
              <div className="form-row full">
                <button className="button primary" type="submit">
                  Login
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
