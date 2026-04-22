import Image from "next/image";
import { getHeroesCatalog } from "@/modules/heroes/server/get-heroes-catalog";
import { getCurrentUser } from "@/modules/auth/server/session";
import { createHeroAction } from "@/modules/heroes/server/create-hero-action";

type HeroesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HeroesPage({ searchParams }: HeroesPageProps) {
  const currentUser = await getCurrentUser();
  const heroes = await getHeroesCatalog();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const created = resolvedSearchParams.created;
  const error = resolvedSearchParams.error;

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Heroes Catalog</span>
        <h1>Каталог персонажей для автоподбора и рейтинговых матчей.</h1>
        <p>
          Здесь будет основной реестр героев Unmatched с их силой, tier и доступностью
          для автоматического назначения в матчах.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Добавить героя</h2>
        {created ? <p className="status-note">Герой успешно создан.</p> : null}
        {error ? <p className="status-note">Не удалось создать героя: {String(error)}.</p> : null}
        {currentUser?.role === "ADMIN" ? (
          <form action={createHeroAction} className="form-card">
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <input className="input" id="name" name="name" required minLength={2} />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="slug">
                  Slug
                </label>
                <input className="input" id="slug" name="slug" placeholder="alice" required minLength={2} />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="tier">
                  Tier
                </label>
                <input className="input" id="tier" name="tier" placeholder="S" required maxLength={16} />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="powerScore">
                  Power score
                </label>
                <input className="input" id="powerScore" name="powerScore" type="number" min={1} max={10000} required />
              </div>
              <div className="form-row full">
                <label className="form-label" htmlFor="image">
                  Image
                </label>
                <input className="input" id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
              </div>
              <div className="form-row full">
                <label className="inline-meta" htmlFor="isActive">
                  <input id="isActive" name="isActive" type="checkbox" defaultChecked />
                  <span>Герой активен</span>
                </label>
              </div>
              <div className="form-row full">
                <button className="button primary" type="submit">
                  Создать героя
                </button>
              </div>
            </div>
          </form>
        ) : (
          <article className="card">
            <h3>Нужен доступ администратора</h3>
            <p>Создание героев и загрузка изображений доступны только ADMIN.</p>
          </article>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Персонажи</h2>
        <div className="grid">
          {heroes.length === 0 ? (
            <article className="card">
              <h3>Каталог пуст</h3>
              <p>
                Добавь персонажей в <code>prisma/seed.ts</code> или через будущую админку.
              </p>
            </article>
          ) : (
            heroes.map((hero) => (
                <article className="card" key={hero.id}>
                  {hero.imagePath ? (
                    <Image className="hero-image" src={hero.imagePath} alt={hero.name} width={320} height={240} />
                  ) : (
                    <div className="hero-image hero-image-empty">No image</div>
                  )}
                <h3>{hero.name}</h3>
                <p>
                  Tier: <strong>{hero.tier}</strong>
                </p>
                <p>
                  Power score: <strong>{hero.powerScore}</strong>
                </p>
                <p>Slug: {hero.slug}</p>
                <p>{hero.isActive ? "Активен" : "Архивный персонаж"}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
