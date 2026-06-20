## Goaly Pro — תוכנית מעודכנת

### Tiers

**🆓 Goaly Free**
- עד **3 יעדים פעילים**
- היסטוריית הפקדות **30 ימים אחורה**
- דוח שבועי בסיסי
- יעד משותף אחד בלבד
- מטבע יחיד

**✨ Goaly Pro — $1.99 / שבוע**
- **שבוע ראשון חינם** (trial אוטומטי בעת רכישה ראשונה; חיוב מתחיל אוטומטית בסוף ה-trial אם המשתמש לא ביטל)
- יעדים ללא הגבלה
- יעדים משותפים ללא הגבלה (עד 10 חברים ליעד)
- תחזיות והמלצות חיסכון (אלגוריתמיות, ללא AI)
- דוחות מתקדמים — חודשי + ייצוא PDF/CSV
- היסטוריה מלאה ללא הגבלת זמן
- תזכורות חכמות להפקדות
- Themes פרימיום + אייקוני יעדים בלעדיים
- גיבוי ענן + ייצוא מלא של הנתונים
- ללא פרסומות (כשנוסיף)
- תמיכה מועדפת

(אין AI Coach — הוסר לבקשתך)

## תכולה טכנית

### 1. תשלומים
- הפעלת **Stripe** (Lovable built-in)
- מוצר יחיד: **Pro Weekly $1.99** עם `trial_period_days: 7`
- חיוב אוטומטי מסוף ה-trial; המשתמש יכול לבטל מתי שירצה ולשמור גישה עד סוף התקופה ששולמה

### 2. סכמת DB — טבלת `subscriptions`
```text
subscriptions
  ├─ user_id (uuid, FK auth.users, unique)
  ├─ tier ('free' | 'pro')
  ├─ status ('trialing' | 'active' | 'canceled' | 'past_due' | 'incomplete')
  ├─ stripe_customer_id
  ├─ stripe_subscription_id
  ├─ current_period_end (timestamptz)
  ├─ trial_end (timestamptz, nullable)
  ├─ cancel_at_period_end (bool)
  └─ created_at / updated_at
```
+ RLS: select own בלבד (כתיבה רק דרך service_role בwebhook)
+ GRANTs: `SELECT` ל-authenticated, `ALL` ל-service_role
+ פונקציית SECURITY DEFINER `is_pro(_user_id uuid)` שמחזירה true כאשר `status IN ('trialing','active') AND current_period_end > now()`

### 3. אכיפת הגבלות (server-side)
- ב-`createServerFn` של יצירת יעד: בדיקת `is_pro` או `count(goals) < 3`
- ב-`createServerFn` של שיתוף יעד: בדיקת tier (Free = יעד משותף אחד)
- שאילתות היסטוריה: סינון `created_at > now() - 30 days` ל-Free
- ייצוא PDF/CSV: רק ל-Pro
- חשוב: לא לסמוך על הלקוח — כל ההגבלות נאכפות ב-server

### 4. UI חדש
- **`/upgrade`** — מסך paywall יפה: כרטיס Pro גלואי, "שבוע ראשון חינם", "רק $1.99/שבוע אחר כך, בטל מתי שתרצה", רשימת benefits, CTA "Start free week"
- **`/settings/subscription`** — מצב מנוי נוכחי, תאריך סיום trial/חידוש, כפתור ביטול / חידוש
- **Pro Badge ✨** בכרטיס החשבון בהגדרות
- **Paywall Sheet** — bottom-sheet שעולה כשמשתמש Free חוצה גבול (יצירת יעד 4, שיתוף נוסף, ייצוא וכו') — מציג ערך, לא מתסכל
- **Lock indicators** — מנעולון עדין על תכונות נעולות (Apple-style)

### 5. Webhook
- `/api/public/webhooks/stripe` — מאמת חתימה (`STRIPE_WEBHOOK_SECRET`), מעדכן את טבלת `subscriptions` על:
  - `checkout.session.completed`
  - `customer.subscription.created` / `updated` / `deleted`
  - `customer.subscription.trial_will_end` (אופציונלי — תזכורת)
  - `invoice.payment_failed` / `payment_succeeded`
- כתיבה דרך `supabaseAdmin` בתוך handler (load inside)

### 6. Trial flow
- Stripe Checkout Session עם `subscription_data.trial_period_days: 7` ו-`payment_method_collection: 'always'` (אוסף כרטיס מראש כדי שהחיוב יעבור אוטומטית)
- במסך ה-paywall נציג בבירור: "שבוע ראשון חינם, אז $1.99/שבוע. בטל מתי שתרצה."

## סדר ביצוע

1. הפעלת Stripe payments (כשתאשר במסך)
2. יצירת מוצר Pro Weekly $1.99 עם trial 7 ימים
3. מיגרציה: טבלת `subscriptions` + `is_pro()` + GRANTs + RLS
4. Webhook handler `/api/public/webhooks/stripe`
5. Hook `useSubscription` + helper `useIsPro`
6. מסך `/upgrade` + Paywall Sheet
7. אכיפת מגבלות ב-server fns: goals, sharing, history, export
8. מסך ניהול מנוי בהגדרות + Pro Badge
9. תכונות Pro חדשות: ייצוא PDF/CSV, היסטוריה מלאה, themes פרימיום, תחזיות

## עלות vs ערך
$1.99/שבוע ≈ פחות מקפה. שבוע חינם מסיר חיכוך כניסה. המודל השבועי מרגיש "קטן" ומקטין נטישה בהשוואה לחודשי. שאיפה: 5-8% conversion מ-trial ל-paid.
