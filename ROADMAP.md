# Roadmap — Núcleo Funcional do App-Rotina

> Origem: veredito do conselho (`/council`). O app hoje é uma casca bonita: tarefas
> hardcoded, nada persiste, stats falsas, só 1 tela. Antes de qualquer polimento novo,
> construir o **loop básico**: criar → concluir → persistir.
>
> Regra de ouro: faça **uma fase por vez**, do topo pra baixo. Não pule pra Supabase/UI
> nova enquanto o loop local não estiver de pé.

---

## Fase 1 — Persistência local (a base de tudo)

**Objetivo:** o que está na tela sobrevive ao fechar o app.

- [x] Criar `src/lib/storage.ts` com `loadTasks()` / `saveTasks()` usando `localStorage`.
- [x] No `DashboardScreen`, inicializar o estado a partir de `loadTasks()` (com `sampleTasks` só como fallback na 1ª vez).
- [x] Salvar em `localStorage` sempre que `tasks` mudar (`useEffect`).
- [x] Persistir mudança de status (concluir/pausar/ativar).

**Pronto quando:** marco uma tarefa como concluída, fecho e reabro o app → ela continua concluída.

**Arquivos:** `src/lib/storage.ts` (novo), `src/screens/DashboardScreen.tsx`

---

## Fase 2 — Criar tarefa

**Objetivo:** o usuário consegue adicionar a própria tarefa (fim do hardcoded).

- [x] Botão "+ Nova tarefa" (botão central da tab bar).
- [x] Modal/sheet com campos: título, categoria, duração, horário (opcional) e prioridade.
- [x] Ao salvar: gera `id`, status `pending`, `elapsed: 0`, e persiste (Fase 1).
- [x] Evento PostHog `task created`.

**Pronto quando:** crio uma tarefa nova do zero e ela aparece + persiste.

**Arquivos:** `src/components/NewTaskSheet.tsx` (novo), `DashboardScreen.tsx`

---

## Fase 3 — Editar e excluir tarefa

**Objetivo:** o menu `MoreVertical` (hoje decorativo) passa a funcionar.

- [x] Ação de excluir tarefa (com confirmação).
- [x] Ação de editar (reaproveita o sheet da Fase 2).
- [x] Persistir as mudanças.

**Pronto quando:** consigo editar e apagar qualquer tarefa, e some/atualiza ao reabrir.

**Arquivos:** `TaskCard.tsx`, `NewTaskSheet.tsx`, `DashboardScreen.tsx`

---

## Fase 4 — Corrigir unidades e o timer

**Objetivo:** acabar com a confusão min × segundos.

- [x] Definir 1 unidade canônica para `duration`/`elapsed` (sugestão: **segundos**).
- [x] Ajustar exibição ("min restantes", "X min") para converter corretamente.
- [x] Revisar o `setInterval` do timer (tick de 1s coerente com a unidade).
- [x] Conferir `ProgressRing` e `TaskCard` (cálculo de progresso).

**Pronto quando:** uma tarefa de "25 min" realmente leva 25 min no timer e mostra os números certos.

**Arquivos:** `DashboardScreen.tsx`, `TaskCard.tsx`, `ProgressRing.tsx`

---

## Fase 5 — Estatísticas reais

**Objetivo:** parar de mentir. Hoje `streak: 12`, `+23%`, `87%` são chumbados.

- [x] Calcular `tasksCompleted`, `focusTime` a partir das tarefas reais.
- [x] Streak/eficiência: ou calcular de verdade, ou remover até existir histórico.
- [x] Guardar histórico diário em `localStorage` para alimentar tendências.

**Pronto quando:** os números do `StatsWidget` batem com o que eu realmente fiz no dia.

**Arquivos:** `src/lib/day-stats.ts`, `StatsWidget.tsx`, `DashboardScreen.tsx`

---

## Fase 6 — Navegação real (Agenda)

**Objetivo:** a tab bar deixa de ser decorativa.

- [x] Finalizar a `AgendaScreen` (hoje vazia) — visão por horário/dia.
- [x] Adicionar rotas reais no `App.tsx` (além de `/`).
- [x] Conectar a `CustomTabBar` à navegação.

**Pronto quando:** troco de aba e vejo telas diferentes de verdade.

**Arquivos:** `src/screens/AgendaScreen.tsx`, `App.tsx`, `CustomTabBar.tsx`

---

## Fase 7 — (Futuro) Sync com Supabase + login

> Só depois que o loop local estiver sólido e em uso.

- [ ] Auth (login).
- [ ] Migrar persistência de `localStorage` para Supabase.
- [ ] Sync entre dispositivos.

---

## Fase 8 — (Futuro) Rotina adaptativa

> O ganho 10x — só faz sentido com dados reais de uso (PostHog + Supabase).

- [ ] Analisar horários reais de conclusão.
- [ ] Sugerir agenda automaticamente.

---

### Como trabalhar

1. Pegue **a fase mais ao topo ainda aberta**.
2. Faça os checkboxes dela.
3. Valide o critério de "Pronto quando".
4. Commit pequeno com o nome da fase (ex.: `feat: fase 1 — persistência local`).
5. Só então passe pra próxima.
