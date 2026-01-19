# Публикация в npm через OIDC (Trusted Publishers)

В Release и Dev-Release используется **OIDC** вместо статического `NPM_TOKEN`. Секреты для публикации в npm не нужны.

---

## Как работает OIDC

### Обычная схема с токеном (как было)

1. Создаётся **долгоживущий токен** на npm (Automation / Classic).
2. Токен кладётся в **Secrets** репозитория.
3. В CI в `~/.npmrc` пишется `//registry.npmjs.org/:_authToken=TOKEN` или задаётся `NODE_AUTH_TOKEN`.
4. `npm publish` отправляет в запросе этот токен, npm считает его доверенным и разрешает публикацию.

Минусы: токен может утечь, его нужно хранить, обновлять и ограничивать права.

---

### OIDC (OpenID Connect) — как стало

**OIDC** — протокол, в котором один сервис (IdP) выдаёт **короткоживущие токены** другому (npm), а тот проверяет, что токен пришёл от нужного источника (репо, workflow, ветка и т.п.), а не «просто от того, кто знает пароль».

Кратко по шагам:

1. **GitHub Actions** при `permissions: id-token: write` может запросить **OIDC-токен** у встроенного IdP GitHub.
2. Этот токен — **JWT** с claims вроде:
   - `repository` = `ton-connect/sdk`
   - `workflow` = `release.yml` / `Dev Release` и т.п.
   - `job_workflow_ref` и др.
3. **npm** при `npm publish --provenance` не ждёт `_authToken`, а:
   - забирает OIDC-токен из окружения (его подставляет GitHub);
   - отправляет его в npm;
   - npm смотрит в **Trusted Publishers**: для пакета `@tonconnect/...` разрешён ли publishing из репо `ton-connect/sdk` и workflow `release.yml` / `Dev Release`.
4. Если да — публикация разрешена, **без знания никакого секрета**. Токен живёт минуты и привязан к этому run’у.

Схема:

```
GitHub Actions (run)  →  запрос OIDC-токена  →  GitHub IdP
       ↓
  JWT с repo/workflow
       ↓
  npm publish --provenance  →  npm registry
       ↓
  npm сверяет JWT с Trusted Publishers  →  OK → publish
```

То есть: **никакого NPM_TOKEN в репозитории**. Доверие строится на том, что GitHub выдал токен с нужными claims, а npm доверяет этим claims, если для пакета настроен соответствующий Trusted Publisher.

---

## Что должно быть в npm (Trusted Publishers)

Публикация пройдёт только если для **каждого** публикуемого пакета на npm включён **Trusted Publisher** с подходящими параметрами.

### Где настраивать

- npmjs.com → пакет (например `@tonconnect/protocol`) → **Settings** → **Publishing access** → **Trusted publishers**.
- Либо: https://www.npmjs.com/package/@tonconnect/protocol/settings → **Trusted publishers**.

### Что указать для GitHub Actions

| Поле | Значение |
|------|----------|
| **Provider** | GitHub Actions |
| **Owner** | `ton-connect` (владелец репозитория) |
| **Repository** | `sdk` |
| **Workflow filename** | `release.yml` для Release, `dev-release.yml` для Dev-Release |

- Workflow filename — **только имя файла** (например `release.yml`), без пути `.github/workflows/`.
- Регистр важен.

В одном Trusted Publisher задаётся один workflow. Чтобы могли публиковать и Release, и Dev-Release, для каждого пакета нужно **два** Trusted Publisher:
- один с `release.yml`,
- второй с `dev-release.yml`.

### Пакеты в монорепе

Добавить Trusted Publisher(ы) для каждого пакета:

- `@tonconnect/protocol`
- `@tonconnect/sdk`
- `@tonconnect/ui`
- `@tonconnect/ui-react`
- `@tonconnect/isomorphic-fetch`
- `@tonconnect/isomorphic-eventsource`

Для каждого пакета: Owner = `ton-connect`, Repository = `sdk`, Workflow = `release.yml`; и отдельно — `dev-release.yml`, если Dev-Release тоже должен публиковать этот пакет.

### Первая публикация

Trusted Publishers действуют только для пакетов, у которых **уже есть хотя бы одна версия**. Самый первый publish для нового пакета нужно сделать по старой схеме (с `NPM_TOKEN`), затем перейти на OIDC.

---

## Что сделано в workflow

1. **`permissions: id-token: write`**  
   Нужно, чтобы runner мог запросить OIDC-токен.

2. **Нет `NPM_TOKEN` и `NODE_AUTH_TOKEN`**  
   В шагах Publish не задаются и не пишутся в `~/.npmrc`. `setup-node` используется только с `registry-url`, без `token`.

3. **`npm install -g npm@11.5.1`**  
   Для Trusted Publishing нужен npm **≥ 11.5.1**. В run перед `npm publish` ставится эта версия.

4. **`npm publish --access public --tag … --provenance`**  
   `--provenance` включает использование OIDC и создание attestations. `--access public` — для scoped-пакетов.

5. **`registry-url: 'https://registry.npmjs.org'` в `setup-node`**  
   Чтобы `npm publish` по умолчанию шёл в нужный registry.

---

## Ограничения

- **Форки**  
  OIDC-токен будет с `repository: MYUSER/sdk`. В Trusted Publishers на npm указан `ton-connect/sdk`, поэтому публикация из форка будет отклоняться. В форке либо не публиковать в тот же @tonconnect/*, либо завести свои пакеты и свой Trusted Publisher под свой репо.

- **Self‑hosted runners**  
  Trusted Publishing у npm рассчитан на GitHub‑hosted (и, по документации, облачные) runners. На своих runner’ах может не работать.

- **Версия npm**  
  Строго **≥ 11.5.1**. Старая Node в `.nvmrc` (например v22) тянет старый npm — поэтому в job перед publish ставится `npm@11.5.1`.

---

## Полезные ссылки

- [npm: Trusted Publishers](https://docs.npmjs.com/trusted-publishers)
- [GitHub: OIDC in Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
