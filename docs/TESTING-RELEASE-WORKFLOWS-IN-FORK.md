# План тестирования Release и Dev-Release workflow в форке

## Ограничения при тестировании в форке

1. **NPM publish** — пакеты `@tonconnect/*` публикуются в npm под организацией `@tonconnect`. В форке у тебя скорее всего нет прав на этот scope, поэтому шаг `Publish to npm` будет падать с 403/404. Ниже есть вариант, как отключить публикацию в npm только для тестов.
2. **GitHub Actions** — в форке по умолчанию выключены. Нужно включить: **Settings → Actions → General → Allow all actions and reusable workflows**.

---

## Подготовка форка

### 1. Форк и клон

```bash
# На GitHub: Fork репозитория ton-connect/sdk в свой аккаунт (например, MYUSER/sdk)

git clone https://github.com/MYUSER/sdk.git
cd sdk
git remote add upstream https://github.com/ton-connect/sdk.git
```

### 2. Включить Actions в форке

- Репозиторий форка → **Settings** → **Actions** → **General**
- **Actions permissions**: "Allow all actions and reusable workflows"
- Сохранить.

### 3. Секреты

| Секрет       | Обязателен | Для чего |
|-------------|------------|----------|
| `NPM_TOKEN` | Да, для полного прогона | Публикация в npm. Без него (или с неверным токеном) шаг **Publish to npm** упадёт. |

Где взять `NPM_TOKEN`:

- https://www.npmjs.com/ → **Access Tokens** → **Generate New Token** (Classic, с правом **Publish**).
- В форке: **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → имя `NPM_TOKEN`, значение — токен.

Для тестов **без реальной публикации в npm** (рекомендуется в форке):

- Либо не добавлять `NPM_TOKEN` — тогда падать будет только шаг `Publish to npm`, остальное можно проверить.
- Либо временно отключить этот шаг по инструкции в разделе «Вариант: отключить NPM publish при тестах» ниже.

---

## Вариант: отключить NPM publish при тестах

Чтобы не трогать логику релизов и при этом не слать ничего в npm из форка, можно условно отключать публикацию, например по переменной или по имени репозитория.

**Вариант A — по переменной (рекомендуется для форка):**

В `.github/workflows/release.yml` у шага **Publish to npm** добавить `if`:

```yaml
      - name: Publish to npm
        if: steps.version_check.outputs.should_release == 'true' && env.SKIP_NPM_PUBLISH != 'true'
        env:
          SKIP_NPM_PUBLISH: ${{ vars.SKIP_NPM_PUBLISH }}
        run: |
          ...
```

В форке: **Settings** → **Secrets and variables** → **Variables** → **New repository variable**  
Имя: `SKIP_NPM_PUBLISH`, значение: `true`. Тогда в форке publish в npm не выполнится.

**Вариант B — по репозиторию:**

Тот же шаг **Publish to npm** выполнять только в основном репозитории:

```yaml
      - name: Publish to npm
        if: steps.version_check.outputs.should_release == 'true' && github.repository == 'ton-connect/sdk'
        run: ...
```

В этом случае в любом форке publish в npm автоматически не запускается, менять Variables не нужно.

Аналогично можно поступить и для **Dev Release** в `dev-release.yml`: добавить `if` с `vars.SKIP_NPM_PUBLISH` или `github.repository == 'ton-connect/sdk'` к шагу **Publish to npm**.

---

## Ветки для тестов

Нужны две ветки:

- `main` — для Release workflow
- `develop` — для Dev-Release workflow

Если в форке есть только `main`:

```bash
# Создать develop от main
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop
```

Дальше все тесты делаем в своём форке (origin = твой fork).

---

# Часть 1: тестирование Release (main)

Release запускается только при push в `main`, когда меняются:

- `packages/**/package.json`
- `package.json`

## 1.1. Сценарий: «Нет изменений версий» (релиз не должен создаваться)

Проверка: при изменении в `main` чего угодно, кроме версий в `package.json`, релиз не делается.

Шаги:

1. На `main`:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Внести изменение **без** смены версий, например в `packages/sdk/package.json` только `description` или в любой не-`package.json` файл.
3. Закоммитить и запушить в `main`:
   ```bash
   git add .
   git commit -m "chore: test release workflow, no version change"
   git push origin main
   ```
4. В **Actions** должен запуститься workflow **Release**.
5. Ожидание:
   - шаги Checkout → Lint → Build → Run tests — зелёные;
   - в **Check for version changes and extract versions** в логе:  
     `No version changes detected. Skipping release.`;
   - `should_release` = `false`;
   - шаги **Create git tags**, **Push tags**, **Publish to npm**, **Create GitHub Release**, **Merge main into develop** — не выполняются (у них `if: steps.version_check.outputs.should_release == 'true'`).

## 1.2. Сценарий: «Смена версии → стабильный релиз (latest)»

Проверка: при увеличении стабильной версии (без `beta`) создаётся релиз с тегом `latest` и `prerelease: false`.

Шаги:

1. Открыть `packages/sdk/package.json` и записать текущую `version` (например, `3.4.0-beta.4`).
2. Поставить чисто стабильную версию, например:
   - было `3.4.0-beta.4` → сделать `3.4.0`
   - или `2.0.0` → `2.0.1`
3. Закоммитить и запушить **только** изменённый `packages/sdk/package.json` в `main`:
   ```bash
   git checkout main
   git add packages/sdk/package.json
   git commit -m "chore(release): sdk 3.4.0"
   git push origin main
   ```
4. Открыть запуск **Release** в Actions.
5. Ожидание:
   - **Check for version changes**:
     - в логе строка вида:  
       `Package @tonconnect/sdk version changed: 3.4.0-beta.4 -> 3.4.0`;
     - `should_release=true`, `has_beta=false`, `release_tag=v3.4.0`.
   - **Create git tags** — создаются теги `@tonconnect/sdk@3.4.0` и `v3.4.0`.
   - **Push tags** — теги уезжают в репозиторий.
   - **Publish to npm** — если не отключён и есть валидный `NPM_TOKEN` с правами на `@tonconnect`: публикация с `--tag latest`. В форке без прав/токена шаг может падать — это ок для теста.
   - **Create GitHub Release**:
     - тег `v3.4.0`;
     - в описании — список пакетов, в т.ч. `@tonconnect/sdk@3.4.0`;
     - **prerelease** = false (галочка «Pre-release» не стоит).
   - **Merge main into develop** — `main` влит в `develop`, `develop` обновлён на origin.

Проверки вручную:

- **Code** → **Releases**: есть релиз `v3.4.0`, не prerelease.
- **Code** → теги: есть `v3.4.0` и `@tonconnect/sdk@3.4.0`.
- Ветка `develop`: последний коммит — merge от `main`, история включает коммит с `3.4.0`.

## 1.3. Сценарий: «Смена версии с `beta` → beta-релиз»

Проверка: если в новой версии есть подстрока `beta`, релиз идёт с тегом `beta` и помечается как prerelease.

Шаги:

1. В `main` изменить версию в `packages/sdk/package.json` на что-то с `beta`, например:
   - `3.4.0` → `3.4.1-beta.0`
   - или `3.5.0-beta.1`
2. Закоммитить и запушить:
   ```bash
   git add packages/sdk/package.json
   git commit -m "chore(release): sdk 3.4.1-beta.0"
   git push origin main
   ```
3. В **Release**:
   - **Check for version changes**: `has_beta=true`, `release_tag=v3.4.1-beta.0`.
   - **Publish to npm** (если не отключён): `--tag beta`.
   - **Create GitHub Release**:
     - тег `v3.4.1-beta.0`;
     - **prerelease** = true (релиз в списке помечен как Pre-release).
   - **Merge main into develop** — выполнен.

Проверки:

- Релиз `v3.4.1-beta.0` в списке помечен как **Pre-release**.
- Тег `v3.4.1-beta.0` есть.

## 1.4. Сценарий: «Изменены версии в нескольких пакетах»

Проверка: в релиз попадают все пакеты, у которых изменилась версия.

Шаги:

1. В `main` поменять `version` в двух пакетах, например:
   - `packages/sdk/package.json`: `3.4.1-beta.0` → `3.4.1-beta.1`
   - `packages/ui/package.json`: `2.4.0-beta.4` → `2.4.0-beta.5`
2. Закоммитить и пушить оба файла.
3. В **Check for version changes** в логе должны быть две строки:
   - `Package @tonconnect/sdk version changed: 3.4.1-beta.0 -> 3.4.1-beta.1`
   - `Package @tonconnect/ui version changed: 2.4.0-beta.4 -> 2.4.0-beta.5`
4. В **changed_packages** (и в описании GitHub Release) — оба:  
   `@tonconnect/sdk@3.4.1-beta.1`, `@tonconnect/ui@2.4.0-beta.5`.
5. **Create git tags** создаёт теги для обоих пакетов и один общий `release_tag` (по первой версии в списке).
6. **Publish to npm** (если не отключён) публикует оба пакета с тегом `beta`.
7. **Merge main into develop** — один merge.

## 1.5. Сценарий: «Push в main без изменений в `package.json`»

Проверка: workflow **Release** не запускается из-за `paths`.

Шаги:

1. На `main` изменить только, например, `README.md` или любой файл вне `packages/**/package.json` и `package.json`.
2. `git add . && git commit -m "docs: update readme" && git push origin main`
3. В **Actions** workflow **Release** не должен появиться (фильтр `paths` его отфильтровал).

---

# Часть 2: тестирование Dev-Release (develop)

Dev-Release запускается на каждый push в `develop` (без фильтра по путям).

## 2.1. Сценарий: «Dev-релиз и инкремент минора»

Проверка: из версии в `package.json` убирается пререлизный суффикс, минор увеличивается, добавляется суффикс `-dev.DATE.HASH`, все пакеты публикуются с тегом `dev`.

Шаги:

1. Перейти на `develop` и подтянуть изменения (в т.ч. после мерджей из main):
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Открыть `packages/sdk/package.json`, запомнить `version` (например, `3.4.1-beta.1`).
3. Сделать любой код-коммит (можно не трогать версии), чтобы запустить workflow:
   ```bash
   echo "// dev test" >> packages/sdk/src/index.ts
   git add packages/sdk/src/index.ts
   git commit -m "chore: trigger dev release"
   git push origin develop
   ```
4. В **Actions** запускается **Dev Release**.
5. В шаге **Extract versions and create tags** в логе для каждого пакета ожидаемо что-то вроде:
   - Base: `3.4.1-beta.1` → Clean: `3.4.1` → минор+1 → **Dev**: `3.5.1-dev.20250130120000.abc1234`  
     (дата и хеш будут актуальные).

   Логика: `CLEAN_VERSION` = `3.4.1` (обрезали `-beta.1`), затем `3.4.1` → major=3, minor=4, patch=1 → newMinor=5 → `3.5.1-dev.DATE.HASH`.

6. Дальше:
   - **Push tags** — теги вида `@tonconnect/sdk@3.5.1-dev.DATE.HASH` и т.п. уходят в репозиторий.
   - **Publish to npm** (если не отключён и есть `NPM_TOKEN`): все пакеты с `--tag dev`. В форке без прав на `@tonconnect` шаг может падать.
   - **Create Release Notes** — в логе вывод с датой, short_hash и списком тегов.
   - **Comment on commits** — под коммитом появляется комментарий с текстом вроде «Dev Release Published» и списком пакетов.

Проверки:

- В **Releases** отдельный релиз для dev не создаётся (в dev-release его и нет), зато есть теги `@tonconnect/<pkg>@X.Y.Z-dev.*`.
- Под коммитом в `develop` — комментарий от Actions со списком пакетов и `npm install <package-name>@dev`.

## 2.2. Сценарий: «Корректность инкремента минора»

Проверка: для разных форматов версий минор увеличивается предсказуемо.

Можно временно подставить в скрипт тестовые значения и посмотреть вывод (локально или в отдельной ветке), либо проверить по логам:

| Base version   | Ожидаемый dev (формат)     |
|----------------|----------------------------|
| `1.1.0`        | `1.2.0-dev.DATE.HASH`      |
| `1.1`          | `1.2.0-dev.DATE.HASH`      |
| `2.4.0-beta.4` | `2.5.0-dev.DATE.HASH`      |
| `3.0.0`        | `3.1.0-dev.DATE.HASH`      |

В логе **Extract versions and create tags** по строкам «Base version» и «Dev version» можно свериться с этими кейсами.

---

# Часть 3: связка Release → Merge main into develop

## 3.1. Развилка develop есть

1. `main`: поднять версию в `packages/sdk/package.json`, закоммитить, запушить.
2. Дождаться успешного **Release** (до шага **Merge main into develop** включительно).
3. Проверить:
   - `develop` содержит все коммиты с `main` и merge-коммит.
   - `git log origin/develop --oneline` — сверху что-то вроде `Merge branch 'main'` или merge от `origin/main`.

## 3.2. Ветки main и develop разъехались

1. На `develop` сделать 1–2 коммита, которых нет в `main`.
2. На `main` изменить версию в `packages/sdk/package.json` и запушить.
3. В **Release** шаг **Merge main into develop** должен выполнить `git merge origin/main --no-edit`. Если конфликтов нет — merge пройдёт, в `develop` появятся и старые коммиты develop, и коммиты main. Если есть конфликты — шаг упадёт, их нужно решать вручную и не полагаться на автоматику.

## 3.3. Ветки develop нет в форке

1. Удалить локально и на origin ветку `develop` (если есть).
2. На `main` изменить версию в `packages/sdk/package.json` и запушить.
3. В **Merge main into develop**:
   - `git show-ref --verify --quiet refs/heads/develop` даёт false;
   - выполнится `git checkout -b develop`, затем `git merge origin/main --no-edit` и `git push origin develop`.
4. В репозитории появится ветка `develop`, в ней — актуальный `main`.

---

# Часть 4: что проверить по шагам

## Release

| Шаг                         | Как проверить |
|-----------------------------|---------------|
| Checkout, Read .nvmrc       | Логи без ошибок |
| Setup pnpm / Node.js        | Установка без ошибок |
| Install dependencies        | `pnpm install` ок |
| Lint                        | `pnpm lint` ок |
| Build                       | `pnpm verify` из build action ок |
| Run tests                   | `pnpm test` ок |
| Check for version changes   | Лог: «version changed» или «No version changes»; `should_release` в outputs |
| Create git tags             | Только при `should_release=true`; теги пакетов + `release_tag` |
| Push tags                   | Теги есть в **Code** → **Tags** |
| Publish to npm              | В форке часто отключён или падает; в основном репо — с `latest`/`beta` |
| Create GitHub Release       | Релиз с нужным тегом и prerelease/flags |
| Merge main into develop     | `develop` обновлён, merge-коммит есть |

## Dev-Release

| Шаг                     | Как проверить |
|-------------------------|---------------|
| До Run tests            | Аналогично Release |
| Extract versions        | В логе Base/Dev и формула минора+1 |
| Push tags               | Теги `@scope/pkg@X.Y.Z-dev.*` в репо |
| Publish to npm          | В форке может падать; в основном — `--tag dev` |
| Create Release Notes    | Текст в логе с датой, short_hash, списком пакетов |
| Comment on commits      | Комментарий к коммиту в `develop` с Dev Release и `@dev` |

---

# Краткий чек-лист

- [ ] Форк создан, Actions включены, при необходимости `SKIP_NPM_PUBLISH` или `github.repository` добавлен в `if` для **Publish to npm** в обоих workflow.
- [ ] Ветки `main` и `develop` есть в форке.
- [ ] **Release, нет изменений версий**: push в main без смены версий → «No version changes», релиз не создаётся.
- [ ] **Release, стабильная версия**: смена на стабильную (например, `3.4.0`) → тег `latest`, релиз не prerelease, merge в develop.
- [ ] **Release, beta-версия**: смена на `*-beta.*` → тег `beta`, prerelease, merge в develop.
- [ ] **Release, несколько пакетов**: смена версий в 2+ пакетах → все в релизе и в тегах.
- [ ] **Release, paths**: push с изменением только не-`package.json` → Release не стартует.
- [ ] **Dev-Release**: push в develop → в логах версии с новым минором и суффиксом `-dev.DATE.HASH`, теги, комментарий к коммиту.
- [ ] **Merge main into develop**: после релиза `develop` содержит main; при отсутствии `develop` ветка создаётся и в неё мерджится main.

---

# Откат после тестов (если нужно)

- Удалить созданные теги в форке (локально и на origin), если мешают.
- Удалить тестовые GitHub Releases.
- Вернуть старые версии в `packages/*/package.json` и запушить.
- Если использовалась переменная `SKIP_NPM_PUBLISH` или правки `if` в Publish — убрать их перед мерджем в основной репозиторий.
