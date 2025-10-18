# Contributing to Bot Manager

[**🇨🇿 Česká verze**](#česká-verze) | [**🇬🇧 English**](#english-version)

---

## 🇨🇿 Česká verze

Děkujeme, že zvažuješ příspěvek do Bot Manager! Vítáme všechny formy příspěvků.

### 🐛 Hlášení chyb

Pokud najdeš chybu, prosím vytvoř Issue s těmito informacemi:

- **Popis problému**: Co se stalo vs. co jsi očekával/a
- **Kroky k reprodukci**: Jak problém vyvolat
- **Environment**: Node.js verze, OS, browser
- **Logy**: Relevantní error logy z konzole/serveru
- **Screenshots**: Pokud jde o UI problém

### ✨ Návrhy na nové funkce

Máš nápad na novou funkci? Skvělé!

1. Nejdřív zkontroluj Issues, jestli někdo nápad již nenavrhoval
2. Vytvoř Issue s popisem:
   - **Problém**: Jaký problém funkce řeší
   - **Řešení**: Jak by funkce měla fungovat
   - **Alternativy**: Zvažoval/a jsi jiná řešení?

### 🔧 Pull Requests

#### Příprava

1. **Fork** repozitář
2. **Clone** svůj fork: `git clone https://github.com/your-username/bot-manager.git`
3. **Vytvoř branch**: `git checkout -b feature/amazing-feature`
4. **Nainstaluj dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../cli && npm install
   ```

#### Development

1. **Udělej změny** v kódu
2. **Testuj**:
   - Spusť backend: `cd backend && npm run dev`
   - Spusť frontend: `cd frontend && npm run dev`
   - Otestuj v prohlížeči
3. **Dodržuj coding style**:
   - Backend: Node.js best practices
   - Frontend: React best practices, komponenty v shadcn/ui stylu
   - Formátování: Prettier (pokud máš nastavené)

#### Commit Messages

Používáme konvenční commit messages s emojis:

```
<emoji> <type>: <description>

Příklady:
✨ feat: Přidání auto-restart funkce
🐛 fix: Oprava memory leak v WebSocket
📝 docs: Aktualizace README
🎨 style: Vylepšení UI checkboxu
♻️ refactor: Refaktoring API endpoints
✅ test: Přidání unit testů
```

**Emoji reference:**
- ✨ `feat` - Nová funkce
- 🐛 `fix` - Bugfix
- 📝 `docs` - Dokumentace
- 🎨 `style` - UI/styling změny
- ♻️ `refactor` - Refaktoring bez změny funkcionality
- ⚡ `perf` - Performance zlepšení
- ✅ `test` - Testy
- 🔧 `config` - Konfigurace
- 🔒 `security` - Security fix

#### Před Pull Requestem

- [ ] Kód funguje lokálně
- [ ] Žádné console.log() v produkčním kódu
- [ ] Commit messages jsou srozumitelné
- [ ] Aktualizoval/a jsi dokumentaci (pokud potřeba)

#### Vytvoření PR

1. **Push** do svého forku: `git push origin feature/amazing-feature`
2. **Vytvoř Pull Request** na GitHubu
3. **Popiš změny**:
   - Co jsi změnil/a
   - Proč (link na Issue pokud existuje)
   - Screenshots (pokud UI změny)

### 📝 Code Style

#### Backend
- CZ komentáře
- Console logy s emojis (✅ ❌ ⚠️)
- Error handling s try/catch
- Async/await (ne promises)

#### Frontend
- CZ texty v UI
- shadcn/ui komponenty když možné
- Tailwind CSS pro styling
- Funkční komponenty + hooks

#### Obecné
- Variable/function names: English
- Komentáře: Czech
- Git commits: Czech + emoji

### 🤝 Code Review

Po vytvoření PR:
- Maintainer provede review
- Může požádat o změny
- Po schválení bude PR mergnut

### 📦 Release Process

Releases dělá maintainer:
1. Update version v `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Deploy na produkci

### 💬 Máš otázky?

Neváhej otevřít Issue nebo Discussion!

---

## 🇬🇧 English Version

Thank you for considering contributing to Bot Manager! We welcome all forms of contributions.

### 🐛 Reporting Bugs

If you find a bug, please create an Issue with:

- **Problem description**: What happened vs. what you expected
- **Steps to reproduce**: How to trigger the issue
- **Environment**: Node.js version, OS, browser
- **Logs**: Relevant error logs from console/server
- **Screenshots**: If it's a UI issue

### ✨ Feature Suggestions

Have an idea for a new feature? Great!

1. First check Issues to see if someone already suggested it
2. Create Issue with description:
   - **Problem**: What problem does the feature solve
   - **Solution**: How should the feature work
   - **Alternatives**: Have you considered other solutions?

### 🔧 Pull Requests

#### Preparation

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/bot-manager.git`
3. **Create branch**: `git checkout -b feature/amazing-feature`
4. **Install dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../cli && npm install
   ```

#### Development

1. **Make changes** in code
2. **Test**:
   - Run backend: `cd backend && npm run dev`
   - Run frontend: `cd frontend && npm run dev`
   - Test in browser
3. **Follow coding style**:
   - Backend: Node.js best practices
   - Frontend: React best practices, shadcn/ui style components
   - Formatting: Prettier (if configured)

#### Commit Messages

We use conventional commit messages with emojis:

```
<emoji> <type>: <description>

Examples:
✨ feat: Add auto-restart feature
🐛 fix: Fix memory leak in WebSocket
📝 docs: Update README
🎨 style: Improve checkbox UI
♻️ refactor: Refactor API endpoints
✅ test: Add unit tests
```

**Emoji reference:**
- ✨ `feat` - New feature
- 🐛 `fix` - Bugfix
- 📝 `docs` - Documentation
- 🎨 `style` - UI/styling changes
- ♻️ `refactor` - Refactoring without changing functionality
- ⚡ `perf` - Performance improvement
- ✅ `test` - Tests
- 🔧 `config` - Configuration
- 🔒 `security` - Security fix

#### Before Pull Request

- [ ] Code works locally
- [ ] No console.log() in production code
- [ ] Commit messages are clear
- [ ] Updated documentation (if needed)

#### Creating PR

1. **Push** to your fork: `git push origin feature/amazing-feature`
2. **Create Pull Request** on GitHub
3. **Describe changes**:
   - What you changed
   - Why (link to Issue if exists)
   - Screenshots (if UI changes)

### 📝 Code Style

#### Backend
- CZ comments
- Console logs with emojis (✅ ❌ ⚠️)
- Error handling with try/catch
- Async/await (not promises)

#### Frontend
- CZ text in UI
- shadcn/ui components when possible
- Tailwind CSS for styling
- Functional components + hooks

#### General
- Variable/function names: English
- Comments: Czech
- Git commits: Czech + emoji

### 🤝 Code Review

After creating PR:
- Maintainer will review
- May request changes
- After approval, PR will be merged

### 📦 Release Process

Releases are done by maintainer:
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Deploy to production

### 💬 Questions?

Feel free to open an Issue or Discussion!
