import Image from "next/image";
import { getHeroesCatalog } from "@/modules/heroes/server/get-heroes-catalog";
import { getCurrentUser } from "@/modules/auth/server/session";
import { createHeroAction } from "@/modules/heroes/server/create-hero-action";
import { deleteAllHeroesAction } from "@/modules/heroes/server/delete-all-heroes-action";
import { deleteHeroAction } from "@/modules/heroes/server/delete-hero-action";

const heroStatusMessages: Record<string, string> = {
  invalid_hero_payload: "Проверь поля формы и попробуй снова.",
  invalid_slug: "Slug оказался пустым или некорректным.",
  hero_slug_exists: "Герой с таким slug уже существует.",
  invalid_image_type: "Разрешены только PNG, JPEG, WEBP и GIF.",
  image_too_large: "Изображение слишком большое. Максимум 5 MB.",
  invalid_delete_payload: "Не удалось удалить героя из-за некорректных данных формы.",
  hero_not_found: "Герой не найден.",
  hero_in_use: "Этого героя нельзя удалить, потому что он уже использовался в матчах.",
  heroes_in_use: "Нельзя удалить весь каталог, пока хотя бы один герой использовался в матчах.",
};

const combatTypeLabels: Record<string, string> = {
  MELEE: "Ближний бой",
  RANGED: "Дальний бой",
};

type HeroesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HeroesPage({ searchParams }: HeroesPageProps) {
  const currentUser = await getCurrentUser();
  const heroes = await getHeroesCatalog();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const created = resolvedSearchParams.created;
  const deleted = resolvedSearchParams.deleted;
  const deletedAll = resolvedSearchParams.deleted_all;
  const error = resolvedSearchParams.error;

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Heroes Catalog</span>
        <h1>Каталог персонажей для матчей и автоподбора.</h1>
      </section>

      <section className="section">
        <h2 className="section-title">Добавить героя</h2>
        {created ? <p className="status-note">Герой успешно создан.</p> : null}
        {deleted ? <p className="status-note">Герой удалён.</p> : null}
        {deletedAll ? <p className="status-note">Весь каталог героев удалён.</p> : null}
        {error ? <p className="status-note">Операция не выполнена: {heroStatusMessages[String(error)] ?? String(error)}.</p> : null}
        {currentUser?.role === "ADMIN" ? (
          <>
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
                  <select className="select" id="tier" name="tier" defaultValue="B" required>
                    <option value="S">S</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor="combatType">
                    Тип боя
                  </label>
                  <select className="select" id="combatType" name="combatType" defaultValue="MELEE" required>
                    <option value="MELEE">Ближний бой</option>
                    <option value="RANGED">Дальний бой</option>
                  </select>
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
            <form action={deleteAllHeroesAction} className="form-card">
              <div className="form-grid">
                <div className="form-row full">
                  <h3>Очистить каталог</h3>
                  <p className="field-hint">Удаляет всех персонажей сразу. Если герои уже были в матчах, операция будет заблокирована.</p>
                </div>
                <div className="form-row full">
                  <button className="button secondary" type="submit">
                    Удалить всех персонажей
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <article className="card">
            <h3>Нужен доступ администратора</h3>
            <p>Создание, загрузка изображений и удаление героев доступны только ADMIN.</p>
          </article>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Персонажи</h2>
        <div className="grid">
          {heroes.length === 0 ? (
            <article className="card">
              <h3>Каталог пуст</h3>
              <p>Добавь персонажей через форму выше или обнови `prisma/seed.mjs` и затем запусти `npm run db:seed`.</p>
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
                <p>Тип: {combatTypeLabels[hero.combatType] ?? hero.combatType}</p>
                <p>Slug: {hero.slug}</p>
                <p>{hero.isActive ? "Активен" : "Архивный персонаж"}</p>
                {currentUser?.role === "ADMIN" ? (
                  <form action={deleteHeroAction}>
                    <input type="hidden" name="heroId" value={hero.id} />
                    <button className="button secondary" type="submit">
                      Удалить героя
                    </button>
                  </form>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
