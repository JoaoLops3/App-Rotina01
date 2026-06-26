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
- [x] No `DashboardScreen`, inicializar o estado a partir de `loadTasks()` (lista vazia na 1ª vez — ver Fase 9.5).
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

**Objetivo:** Hoje `streak: 12`, `+23%`, `87%` são chumbados.

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

## Fase 7 — Notificações in-app (MVP)

**Objetivo:** central de alertas dentro do app, com histórico e badge no sino.

- [x] Rota `/notificacoes` + `NotificationsScreen` (inbox agrupada Hoje/Ontem/Anteriores)
- [x] Tipos: `task_upcoming` (~10 min antes), `task_completed`, `daily_goal_reached`, `streak_milestone`, `streak_at_risk`
- [x] Persistência em `localStorage` (`app-rotina:notifications`) com `dedupKey`
- [x] Polling 60s para lembretes de tarefas agendadas (app aberto)
- [x] Sino no `HeaderBar` → navega + badge coral só com não lidas
- [x] Perfil → linha Notificações → mesma tela

**Pronto quando:** concluo tarefa, bato meta ou chega horário agendado → alerta aparece na central, persiste ao reabrir, sino mostra não lidas.

**Branch:** `feat/notificacoes` (mergeado na `main` via PR #6)

---

## Fase 8 — Notificações mobile + UX

**Objetivo:** alertas funcionam com app fechado e experiência polida.

### Crítico para mobile real

- [x] `@capacitor/local-notifications` — push com app fechado (ex.: lembrete às 14:50)
- [x] Permissão do sistema (iOS/Android) para notificações fora do app
- [x] Agendamento nativo ao criar/editar tarefa com horário; cancelar ao concluir/excluir

### Importante para UX

- [x] Preferências — ligar/desligar por tipo; lead time configurável (5 / 10 / 15 min)
- [x] Toque na notificação → deep link (tarefa no Dashboard ou Agenda)
- [x] Tipo `task_overdue` — passou horário e tarefa ainda `pending`
- [x] Tipo `timer_finished` — duração da tarefa ativa esgotou

**Pronto quando:** agendo tarefa às 15h, fecho o app, e às 14:50 recebo alerta nativo no celular.

**Branch:** `feat/notificacoes-fase-8`

### Já feito no polish pós-MVP (não bloqueia Fase 9)

- [x] Sync inbox com pushes entregues (`getDeliveredNotifications` ao abrir/voltar ao app)
- [x] Textos centralizados em `src/lib/notification-copy.ts`
- [x] Preferências separadas: alertas no celular vs central do app
- [x] Timer em background não cancela push `timer_finished` antes de disparar

---

## Fase 8.5 — Polish de notificações (pós-MVP) ✅

**Objetivo:** fechar lacunas deixadas na Fase 8 antes de partir para Supabase.

### Visual / identidade

- [ ] **Ícone do push no iOS** — trocar ícone genérico do Capacitor pelo App Rotina (asset no Xcode / `AppIcon`) — *adiado → Fase 10*
- [ ] **Ícone do push no Android** — `smallIcon` em `res/drawable` + `capacitor.config.ts` (quando pasta `android/` voltar ao repo) — *adiado → Fase 10*

### Push nativo — tipos que hoje são só in-app

- [x] **`task_completed`** — copy unificada via `timer_finished` → "Tarefa concluída" quando timer acaba; dedup na inbox evita duplicata ao reabrir
- [x] **`streak_at_risk`** — agendar push nativo às 20h local (1x/dia, se streak > 0 e 0 conclusões)
- [ ] **`daily_goal_reached`** — push ao bater meta — *adiado → Fase 10*
- [ ] **`streak_milestone`** — push ao atingir 3, 7, 14, 30 dias — *adiado → Fase 10*

### Validação

- [x] Testar fluxo completo no **iOS** (permissão, agendamento, deep link, sync inbox, streak 20h)
- [x] Limpar notificações entregues do centro do sistema após sync na inbox (`removeDeliveredNotifications`)

**Pronto quando:** usuário entende conclusão de tarefa sem abrir o app; streak em risco avisa à noite com app fechado. *(ícones customizados do push adiados para Fase 10.)*

**Branch:** mergeado na `main` via PR #8 (`feat/notificacoes-fase-8 e 8.5`)

---

## Fase 9 — Seletor de avatar no Perfil ✅

**Objetivo:** o usuário escolhe um avatar DiceBear (toon-head) no Perfil; a escolha persiste localmente e aparece no header.

- [x] Types (`src/types/avatar.ts`) e `buildAvatarUrl` (DiceBear com `backgroundColor`).
- [x] `profile-storage.ts` + `ProfileProvider` / `useProfile()` (`app-rotina:profile`).
- [x] Componentes `Avatar`, `AvatarPicker`, `AvatarPickerSheet` (portal no `body`).
- [x] Hook `useUpdateAvatar` (localStorage hoje; contrato pronto para Supabase).
- [x] Integração: `ProfileScreen` (avatar clicável + atalho), `HeaderBar`, `DashboardScreen`, `App.tsx`.
- [x] Evento PostHog `avatar updated`.

**Pronto quando:** abro Perfil → escolho avatar → confirmo → aparece no Perfil e no header → persiste ao reabrir.

**Arquivos:** `src/types/avatar.ts`, `src/lib/avatar-url.ts`, `src/lib/profile-storage.ts`, `src/lib/profile-context.tsx`, `src/hooks/useUpdateAvatar.ts`, `src/components/Avatar.tsx`, `src/components/AvatarPicker.tsx`, `src/components/AvatarPickerSheet.tsx`, `ProfileScreen.tsx`, `HeaderBar.tsx`, `DashboardScreen.tsx`, `App.tsx`  
**Branch:** mergeado na `main` via PR #9 (`feat/avatar-picker-perfil`)

---

## Fase 9.5 — Primeira experiência limpa (sem tarefas demo) ✅

**Objetivo:** novos usuários não recebem mais 7 tarefas fake na 1ª abertura.

- [x] Remover `sampleTasks` de `tasks-context.tsx`.
- [x] Fallback `loadTasks() ?? []` — lista vazia na 1ª vez.
- [x] `completedRecordedRef` semeia a partir das tarefas carregadas (não do demo).
- [x] Empty state no Dashboard já existente ("Nenhuma tarefa no momento").

**Pronto quando:** instalação limpa → Dashboard vazio → crio tarefa pelo + → persiste ao reabrir.

**Arquivos:** `src/lib/tasks-context.tsx`  
**Branch:** mergeado na `main` via PR #10 (`feat/remover-sample-tasks`)

---

## Fase 10 — Login, conta e sync na nuvem (Supabase)

> Só depois que o loop local, notificações e perfil estiverem sólidos.

**Objetivo:** o usuário tem conta, dados na nuvem e continuidade ao trocar de aparelho.

- [ ] Auth — telas de login e criação de conta.
- [ ] Migrar persistência de `localStorage` para Supabase (tarefas, histórico, perfil, preferências).
- [ ] **Sync ao trocar de celular** — mesma conta, mesmos dados em qualquer dispositivo (tarefas, histórico, perfil, avatar).
- [ ] Importar dados locais na criação da conta ("usar o que já tenho neste aparelho").
- [ ] **Sync de notificações entre dispositivos** (inbox unificada na nuvem).
- [ ] **Notificações remotas (servidor)** — push via backend/Supabase Edge Functions.
- [ ] Ícones customizados do push (iOS + Android) — itens adiados da Fase 8.5.
- [ ] Push nativo `daily_goal_reached` e `streak_milestone` — itens adiados da Fase 8.5.

**Pronto quando:** crio conta no celular A, adiciono tarefas, faço login no celular B → vejo as mesmas tarefas e perfil.

**Arquivos (previstos):** `src/lib/supabase.ts`, migrations `supabase/`, telas de auth, camada de sync sobre `storage.ts` / `profile-storage.ts`

---

## Fase 11 — Rotinas prontas (foco em acolhimento / TDAH)

> **Depois da Fase 10** — roda após login/criação de conta, não antes.

**Objetivo:** quem acabou de criar conta não enfrenta lista vazia. Oferecer rotinas prontas, pensadas para quem tem dificuldade com foco e organização (incl. público com TDAH), com sensação de acolhimento e capacidade real de manter uma rotina.

### Fluxo (pós-login / pós-cadastro)

- [ ] Tela de boas-vindas após criar conta (ou 1º login) — "Vamos montar sua rotina".
- [ ] Perguntas curtas (3–5): foco principal (estudos, trabalho, saúde, equilíbrio/lazer), intensidade (leve vs completa).
- [ ] Preview da rotina sugerida antes de confirmar.
- [ ] Opção **"Começar do zero"** sempre visível — ninguém é obrigado ao template.
- [ ] Ao confirmar: injeta tarefas no storage (local + Supabase se logado).
- [ ] Usuário pode editar, excluir e criar novas tarefas a qualquer momento.

### Conteúdo das rotinas

- [ ] Templates por perfil: estudos, trabalho, saúde, equilíbrio geral.
- [ ] Blocos realistas para TDAH: 15–25 min, pausas explícitas, poucas tarefas no 1º dia (3–5).
- [ ] Copy acolhedora — ponto de partida, não prescrição clínica.
- [ ] Reaplicar template depois: atalho no Perfil ("Montar nova rotina").

**Pronto quando:** crio conta → respondo perguntas → escolho "Estudos, rotina leve" → Dashboard já tem tarefas úteis → posso apagar uma e criar outra sem perder o resto.

**Arquivos (previstos):** `src/lib/routine-templates.ts`, `src/screens/OnboardingRoutineScreen.tsx`, integração pós-auth em `App.tsx`

---

## Fase 12 — Agenda semanal

> Visão além do dia — planejar a semana inteira.

**Objetivo:** a Agenda deixa de ser só "hoje" e passa a mostrar a semana do usuário.

- [ ] Seletor de semana (navegar semana anterior / próxima).
- [ ] Visão por dia da semana com tarefas agrupadas (agendadas e livres).
- [ ] Tarefas com `scheduledTime` aparecem no dia correto; tarefas sem horário em seção "Sem horário".
- [ ] Destaque do dia atual na grade/semana.
- [ ] (Opcional) Arrastar tarefa entre dias — só se não complicar o modelo de dados.

**Pronto quando:** abro Agenda → vejo Seg–Dom da semana atual → navego para semana passada/futura → tarefas aparecem no dia certo.

**Arquivos (previstos):** `src/screens/AgendaScreen.tsx`, `src/lib/week-utils.ts`, possível campo `scheduledDate` em `Task`

---

## Fase 13 — (Futuro) Rotina adaptativa

> O ganho 10x — só faz sentido com dados reais de uso (PostHog + Supabase).

- [ ] Analisar horários reais de conclusão.
- [ ] Sugerir agenda automaticamente com base no histórico.

---

### Como trabalhar

> **Status atual:** Fases 1–9.5 concluídas na `main`. **Próxima fase aberta:** Fase 10 — login, conta e sync Supabase.

1. Pegue **a fase mais ao topo ainda aberta**.
2. Faça os checkboxes dela.
3. Valide o critério de "Pronto quando".
4. Commit pequeno com o nome da fase (ex.: `feat: fase 1 — persistência local`).
5. Só então passe pra próxima.
