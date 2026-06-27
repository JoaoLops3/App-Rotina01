# Performance — Fase 2 baseline

Métricas coletadas após implementação da Fase 2 (`npm run build`, Vite 5.4.8).

## Bundle (gzip)

| Chunk | Tamanho (gzip) | Notas |
|-------|----------------|-------|
| `index-*.js` (entrada app) | **17,15 KB** | Lógica da aplicação |
| `vendor-ionic` | 284,26 KB | Ionic + react-router |
| `vendor-analytics` | 71,30 KB | posthog-js + @posthog/react |
| `vendor-motion` | 43,05 KB | framer-motion (LazyMotion + domMax) |
| `vendor-icons` | 2,60 KB | lucide-react |
| `index-*.css` | 14,07 KB | Tailwind + design system |
| **Total JS eager (boot)** | **~418 KB** | Soma dos chunks carregados no cold start |

### Comparação com Fase 1

| Métrica | Fase 1 (referência) | Fase 2 |
|---------|---------------------|--------|
| Chunk principal único | ~359 KB gzip | 17 KB (app) + vendors separados |
| Cache entre deploys | Tudo invalida junto | Vendors estáveis cacheiam separado |
| Google Fonts | 2+ requests externos | 0 (self-host em `/fonts/`) |

Meta aspiracional de entrada &lt; 280 KB gzip: **atingida no chunk de app**; Ionic continua dominante no boot total.

## Lazy routes (inalterado da Fase 1)

| Rota | Chunk (gzip) |
|------|----------------|
| Agenda | 0,97 KB |
| Stats | 2,03 KB |
| Perfil | 2,88 KB |
| Notificações | 2,19 KB |
| Preferências notif. | 1,87 KB |

## Runtime — re-renders

| Cenário | Comportamento esperado |
|---------|------------------------|
| Abrir `NewTaskSheet` | Handlers estáveis (`useCallback` + refs); listas não re-renderizam se `tasks` inalterado |
| Pausar 1 tarefa em lista de 20 | Apenas 1 `TaskCard` atualiza (`React.memo` + callbacks estáveis) |
| Timer ativo | Tick isolado em `useActiveElapsed` — só card ativo por segundo |

Validar com React DevTools Profiler em QA manual.

## Storage

| Chave | Política pós-Fase 2 |
|-------|---------------------|
| `trilho:tasks` | Poda automática: `completed` com `completedAt` &gt; 14 dias removidas |
| Legado sem `completedAt` | Mantidas até nova conclusão |
| `trilho:history` | 90 dias (inalterado) |

## Mobile / GPU

- `max-width: 768px` e `html.native-platform`: `.card-glass` e tab bar sem `backdrop-filter`
- `OrbBackground`: desligado no nativo e com `prefers-reduced-motion: reduce`
- Desktop/web: blur e orbs preservados

## Analytics (nativo)

PostHog no Capacitor: `autocapture`, `capture_pageview`, `capture_pageleave` desligados; recorder/surveys já off; eventos explícitos (`captureEvent`) mantidos.

## Como re-medir

```bash
npm run build
# Ver coluna "gzip" no output do Vite

# FCP: Chrome DevTools → Performance → mobile throttled
# Profiler: React DevTools → Profiler → pausar tarefa com 20 cards
# localStorage: Application → Local Storage → trilho:tasks
```
