# Antigravity Swarm — Project Context

## תיאור הפרויקט

**Antigravity Swarm** הוא מערכת multi-agent אוטונומית המבוססת על תזמון משימות מרכזי דרך Supabase, עם agents שפועלים כ-workers על GitHub Actions ו-locally.

המטרה: ביצוע משימות AI מקבילי ועצמאי, עם זיכרון משותף ותיאום בין agents.

---

## ארכיטקטורה

```
GitHub Actions (CI trigger)
        │
        ▼
   worker.py          ← agent ראשי שמושך משימות ומבצע
        │
        ├── שולף מ-task_queue (Supabase)
        ├── כותב תוצאות ל-agent_memory (Supabase)
        └── מעדכן claude_context לפני כל סשן
```

### רכיבים

| רכיב | תפקיד |
|------|--------|
| `worker.py` | Agent ראשי — שולף משימות מה-queue ומבצע |
| `GitHub Actions` | Trigger לריצת workers (scheduled / event-driven) |
| `Supabase` | Backend מרכזי — DB + Auth + Realtime |

---

## טבלאות Supabase

### `task_queue`
תור המשימות המרכזי של ה-Swarm.

| עמודה | סוג | תיאור |
|-------|-----|--------|
| `id` | uuid | מזהה ייחודי |
| `task_type` | text | סוג המשימה |
| `payload` | jsonb | נתוני הקלט |
| `status` | text | `pending / in_progress / done / failed` |
| `assigned_to` | text | שם ה-agent שקיבל |
| `created_at` | timestamp | זמן יצירה |
| `updated_at` | timestamp | עדכון אחרון |

### `agent_memory`
זיכרון משותף בין כל ה-agents.

| עמודה | סוג | תיאור |
|-------|-----|--------|
| `id` | uuid | מזהה ייחודי |
| `agent_id` | text | שם/מזהה ה-agent |
| `key` | text | מפתח הזיכרון |
| `value` | jsonb | תוכן הזיכרון |
| `context_type` | text | `task / learning / state` |
| `created_at` | timestamp | זמן שמירה |

---

## תקשורת ישירה עם Antigravity (ללא מתווך)

Supabase project: `ayhplxbihuyimtrzimrh` (Antigravity-Brain, eu-central-1)

**בתחילת כל סשן — בדוק inbox:**
```sql
SELECT id, from_agent, subject, message, priority, created_at
FROM claude_inbox WHERE status = 'unread' ORDER BY priority DESC, created_at ASC;
```
אם יש הודעות — קרא, סמן כ-read, והגב ל-`claude_outbox`.

**לכתוב תשובה ל-Antigravity:**
```sql
INSERT INTO claude_outbox (to_agent, subject, message, message_type)
VALUES ('antigravity', '<subject>', '<message>', 'response');
```

**ערוצי תקשורת:**
| טבלה | כיוון | תיאור |
|------|--------|--------|
| `claude_inbox` | Antigravity → Claude | הודעות נכנסות |
| `claude_outbox` | Claude → Antigravity | תשובות ויוזמות |
| `hive_comms` | דו-כיווני | broadcast כללי |
| `task_queue` | משותף | משימות לביצוע |

---

## חוקי עבודה

1. **תמיד commit אחרי שינוי** — כל שינוי קוד מלווה ב-commit עם הודעה ברורה
2. **תמיד עדכן `claude_context`** — לפני סיום כל סשן, עדכן את ה-context ב-`agent_memory` עם מה שנעשה
3. **אל תשנה `task_queue` ידנית** — רק דרך `worker.py` או API מוגדר
4. **status transitions** — `pending → in_progress → done/failed` בלבד, לעולם לא אחורה
5. **secrets** — API keys רק דרך GitHub Secrets (CI) או `~/.antigravity.env` (local)
