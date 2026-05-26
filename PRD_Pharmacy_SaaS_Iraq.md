# 🏥 نظام إدارة الصيدليات العراقي - وثيقة متطلبات المنتج (PRD) الشاملة
**الإصدار:** 1.0-MVP | **نموذج التطوير:** Solo Developer + AI-Assisted (OpenCode) | **النمط:** Offline-First SaaS  
**تاريخ الإنشاء:** 2026-05-26 | **الحالة:** جاهز للتنفيذ الفوري | **إدارة المهام:** Beads Task Management

---

## 📌 1. معلومات المشروع
| البند | القيمة |
|------|--------|
| 🎯 **الهدف** | بناء نظام سطح مكتب بسيط، سريع، ويعمل أوفلاين-أول لإدارة المخزون، البيع السريع، تتبع الصلاحيات، والأدوية الخاضعة للرقابة في صيدليات العراق |
| 👥 **المستخدمون** | المالك (تحكم كامل + تقارير) + المساعد/كاشير (واجهة بيع مبسطة فقط) |
| 🖥️ **المنصة** | Windows Desktop (Electron) مع دعم أجهزة POS ثابتة وشاشات اللمس |
| 💰 **نموذج الإيراد** | اشتراك شهري متكرر (MRR) مع فترة تجريبية مجانية |
| 🚀 **خطة الإطلاق** | إطلاق تجريبي (Beta) مع 5-10 صيدليات مختارة → جمع ملاحظات → إطلاق عام مباشر |

---

## 🎯 2. الرؤية والهدف الاستراتيجي
بناء نظام صيدلي يركز على **السرعة، البساطة، والاستمرارية** رغم ضعف البنية التحتية للإنترنت في العراق. يعتمد على فلسفة Local-First مع مزامنة ذكية وآمنة عند عودة الاتصال، ويصمم ليكون الأخف في فئته مع واجهة لا تحتاج تدريباً مسبقاً، مع ضمان الامتثال للقوانين الصحية المحلية عبر سجل تدقيق غير قابل للتعديل.

---

## 👥 3. المستخدمون وسيناريوهات الاستخدام الأساسية
| الدور | الهدف الرئيسي | السيناريو الأكثر تكراراً |
|------|--------------|------------------------|
| 👑 **المالك** | مراقبة الأداء، التحكم في الإعدادات، إدارة المخزون والموردين، الاطلاع على التقارير المالية والرقابية | فتح اللوحة صباحاً → رؤية المبيعات اليومية + التنبيهات العاجلة → تعديل حدود المخزون → تصدير طلب للمورد |
| 👨‍💼 **المساعد/كاشير** | بيع سريع، فحص توفر الدواء، تنبيهات الصلاحية، إتمام المعاملات اليومية | مسح باركود → تأكيد الكمية والسعر → اختيار طريقة الدفع → طباعة فاتورة → خصم تلقائي من المخزون (<10 ث) |

---

## 🧩 4. المتطلبات الوظيفية (وحدات النظام)
| الوحدة | الميزات الأساسية | مخرجات الـ AI المتوقعة |
|--------|----------------|----------------------|
| 📦 Inventory | إضافة/تعديل دواء، حد أدنى قابل للتخصيص، تتبع صلاحية، منع بيع منتهي الصلاحية، تصنيف الأدوية الخاضعة للرقابة | Prisma Schema، CRUD Services، Validation Rules، UI Components |
| 🛒 POS | مسح باركود، بحث ذكي (عربي/إنجليزي)، سلة بيع، خصم مخزون لحظي، طباعة فاتورة مفصلة، دعم كاش/بطاقة بالدينار | Cart State، Barcode Handler، Print Template، Transaction Service |
| 🔄 Sync Engine | تخزين محلي، قائمة انتظار للمعاملات، مزامنة عند الاتصال، Last-Write-Wins، Audit Log إلزامي | Offline Queue، Sync Scheduler، Conflict Resolver، Audit Logger |
| 📤 Supplier Hub | تصدير قائمة النواقص (PDF/Excel)، إرسال واتساب، استيراد فاتورة مورد، تحديث سعر الشراء والمخزون تلقائياً | Export Generator، File Parser، Price Tracker، Fuzzy Matching |
| 📊 Dashboard | مؤشرات يومية، تقارير مالية/مخزون/رقابية، تصدير PDF/Excel، تنبيهات استباقية ذكية | Chart Components، Report Generators، Alert Service، Export Router |
| 🔐 Auth & RBAC | دخول باسم/كلمة مرور، دعم PIN/بصمة، قفل تلقائي بعد خمول، صلاحيات (مالك/مساعد)، إخفاء أسعار التكلفة والربح عن المساعد | Auth Service، Role Guards، Session Manager، PIN/Bio Hook |

---

## ⚙️ 5. المتطلبات غير الوظيفية
| البند | المتطلب |
|------|--------|
| ⚡ **الأداء** | وقت استجابة واجهة البيع < 200ms محلياً، إتمام فاتورة < 10s، عمل سلس على 4GB RAM |
| 📶 **Offline-First** | عمل كامل بدون إنترنت، مزامنة تلقائية عند العودة، صفر فقدان للبيانات، طابور معاملات محلي |
| 🔐 **الأمان** | تشفير محلي (SQLCipher)، TLS 1.3 للنقل، Audit Log غير قابل للحذف/التعديل، إخفاء التكلفة عن المساعد |
| 🖥️ **التوافق** | Windows 10/11، دعم شاشات POS، دقة 1366x768 كحد أدنى، دعم لوحة المفاتيح والباركود سكanner |
| 🔄 **التحديثات** | Auto-Update في الخلفية مع Delta Patches، لا إعادة تشغيل إجباري أثناء الورديات |

---

## 🏗️ 6. المعمارية التقنية ومكدس التطوير
[Electron + React/TS] ←→ [better-sqlite3 + SQLCipher] ←→ [Local Sync Queue]
         ↑                              ↑
   (UI/Desktop App)              (Conflict Resolution & Audit)
         ↓
   [Cloud Backend (NestJS)] ←→ [PostgreSQL] ←→ [S3/R2 (Backups/Receipts)]
         ↑
   [Stripe/MRR] + [Sync REST API + WebSockets]

**لماذا؟** Electron يوفر حزمة سطح مكتب جاهزة، etter-sqlite3 خفيف ويعمل أوفلاين 100%، NestJS منظم ويسهل على الـ AI توليد وحدات قابلة للاختبار، وPostgreSQL موثوق للنسخ السحابي والمزامنة متعددة الأجهزة.

---

## 🗄️ 7. مخطط قاعدة البيانات المحلي (Prisma)
num Role { OWNER, ASSISTANT }
num PaymentMethod { CASH, CARD }
num SyncStatus { PENDING, SYNCED, CONFLICT }

model User {
  id        String   @id @default(cuid())
   username  String   @unique
  ole      Role     @default(ASSISTANT)
  pinHash   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Product {
  id            String   @id @default(cuid())
  arcode       String   @unique
  
ameAr        String
  
ameEn        String
  category      String
  stockQty      Int      @default(0)
  minThreshold  Int      @default(10)
  xpiryDate    DateTime
  purchasePrice Decimal  @default(0)
  sellPrice     Decimal
  isControlled  Boolean  @default(false)
  supplier      String?
   updatedAt     DateTime @default(now())
}

model Transaction {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  	otal       Decimal
  payment     PaymentMethod @default(CASH)
  cashierId   String
  items       TransactionItem[]
  syncStatus  SyncStatus @default(PENDING)
}

model TransactionItem {
  id        String    @id @default(cuid())
  	xId      String
  productId String
  qty       Int
  price     Decimal
  product   Product   @relation(fields: [productId], references: [id])
}

model SyncQueue {
  id        String   @id @default(cuid())
  payload   Json
  deviceId  String
  createdAt DateTime @default(now())
  status    SyncStatus @default(PENDING)
}

model AuditLog {
  id        String   @id @default(cuid())
   userId    String
  ction    String   // e.g., "STOCK_DECREMENT", "LOGIN", "SYNC_CONFLICT"
  details   Json
  createdAt DateTime @default(now())
}

---

## 🔄 8. منطق المزامنة الأوفلاين (Offline-First Sync)
1. **Local-First**: كل عملية بيع/تعديل تُحفظ في etter-sqlite3 فوراً وتُضاف لجدول SyncQueue.
2. **Online Detection**: 
avigator.onLine + ping دوري للخادم كل 15s.
3. **Sync Push**: إرسال دفعة من SyncQueue للخادم عبر POST /api/sync/push.
4. **Conflict Resolution**: Last-Write-Wins على مستوى product.stockQty مع مقارنة updatedAt. يُسجل الفرق تلقائياً في AuditLog.
5. **Pull Delta**: الخادم يعيد التغييرات منذ آخر sync_cursor لتطبيقها محلياً.
6. **Retry Logic**: فشل المزامنة → إعادة محاولة بـ Exponential Backoff (2s, 4s, 8s... حتى 60s).
7. **Data Integrity**: لا يُحذف أي سجل من SyncQueue أو AuditLog. يُعلّم فقط بـ SYNCED.

---

## ☁️ 9. هيكل الـ API السحابي (MVP)
| المسار | الطريقة | الوظيفة | المصادقة |
|-------|--------|--------|---------|
| /api/auth/login | POST | تسجيل الدخول، إصدار JWT | عامة |
| /api/sync/push | POST | استقبال دفعة معاملات أوفلاين | JWT (Pharmacy Owner) |
| /api/sync/pull | GET | جلب التغييرات منذ آخر مزامنة | JWT |
| /api/products | GET/POST/PATCH | إدارة الأصناف وتحديث الأسعار | JWT (OWNER فقط) |
| /api/reports/daily | GET | بيانات اللوحة اليومية والمؤشرات | JWT |
| /api/backup/upload | POST | رفع نسخة مشفرة محلياً للسحابة | JWT |

---

## 🤖 10. سير عمل التطوير بالذكاء الاصطناعي (OpenCode)
| المرحلة | المهمة | Prompt جاهز للنسخ |
|--------|-------|------------------|
| 1️⃣ التأسيس | إعداد Electron + React + TS + Vite | "Generate a production-ready Electron + React + TypeScript + Vite boilerplate. Include ESLint, Prettier, and folder structure: src/main, src/renderer, src/db, src/sync, src/ui. Add electron-builder config for Windows NSIS." |
| 2️⃣ DB المحلي | إعداد Prisma + SQLite + SQLCipher | "Create Prisma schema with User, Product, Transaction, TransactionItem, SyncQueue, AuditLog. Add setup script to initialize better-sqlite3 with SQLCipher encryption. Generate migration and seed file with 10 mock products." |
| 3️⃣ الواجهة | شاشة POS + بحث + سلة | "Build a fast POS UI in React with Tailwind: barcode input, live search against local Prisma DB, cart table with qty controls, total calculator. Use Zustand for state. Mock data only for now." |
| 4️⃣ البيع | خصم مخزون + إنشاء فاتورة + طباعة | "Write a checkoutService that: 1. Validates cart stock, 2. Creates Transaction in SQLite, 3. Decrements Product.stockQty, 4. Logs to AuditLog, 5. Generates printable HTML invoice using window.print()." |
| 5️⃣ المزامنة | Local Queue + Sync Logic | "Implement a sync module using better-sqlite3 that: batches SyncQueue items, pings server when online, POSTs to /api/sync/push, applies server response, retries with exponential backoff on failure." |
| 6️⃣ الخادم | NestJS API + Prisma + PostgreSQL | "Generate NestJS app with Prisma provider for PostgreSQL. Add Auth, Sync, Products, Reports modules. Enable JWT guard, Swagger at /api/docs, and implement /api/sync/push & /pull with delta logic." |
| 7️⃣ التقارير | Dashboard + Export + Alerts | "Build a Dashboard with Recharts showing dailySales, netProfit, lowStockCount, expiringSoon. Add PDF/Excel export using jsPDF & xlsx. Create toast alerts when thresholds breached." |

✅ **أفضل الممارسات:**  
- اطلب Component أو Service واحد في كل Prompt.  
- أرفق السياق دائماً: "Context: We're using Electron + React + Prisma + better-sqlite3. Here is the current schema..."  
- اطلب اختبار وحدة واحد على الأقل: "Add 2 Vitest unit tests for this service before generating code."  
- استخدم Git Feature Branches: eat/pos-checkout, ix/sync-conflict, إلخ.

---

## 🧵 11. هيكل المهام في Beads Task Management
> أنشئ 6 Epics في Beads، ثم أضف المهام أدناه. فعّل Chain Mode واربط التبعيات.

| المهمة | الـ Epic | الأولوية | التبعيات | الوصف المختصر | AI Prompt (ملخص) | معايير القبول |
|--------|----------|----------|----------|---------------|------------------|---------------|
| 1.1 | التأسيس | P0 | - | إعداد بيئة Electron + React + TS | Generate production-ready Electron+React+TS+Vite boilerplate... | 
pm run dev يفتح نافذة، لا أخطاء Console |
| 1.2 | التأسيس | P0 | 1.1 | إعداد SQLite + Prisma + SQLCipher | Create Prisma schema... Add SQLCipher setup... | prisma migrate ينجح، الجداول موجودة |
| 2.1 | POS | P0 | 1.2 | مكون البحث بالباركود والاسم | Create SearchBar component querying SQLite locally... | بحث يعمل أوفلاين، تأخير <200ms |
| 2.2 | POS | P0 | 2.1 | سلة الشراء وحساب الإجمالي | Build Cart component with Zustand, validate stock... | إضافة/حذف أصناف، منع الإضافة عند الصفر |
| 2.3 | POS | P0 | 2.2 | إتمام البيع + خصم المخزون + طباعة | Write checkoutService: validate, create TX, decrement stock, print... | عملية بيع تسجل، فاتورة تطبع، <10s |
| 3.1 | المزامنة | P0 | 2.3 | قائمة الانتظار المحلية (SyncQueue) | Implement SyncQueue table in SQLite, expose push/pop methods... | المعاملات تُحفظ عند الانقطاع، لا فقدان |
| 3.2 | المزامنة | P1 | 3.1 | كاشف الاتصال + جدولة المزامنة | Create syncScheduler: ping server, process queue, retry backoff... | مزامنة تلقائية عند العودة، فشل يعيد المحاولة |
| 3.3 | المزامنة | P0 | 3.2 | حل التعارض (Last-Write-Wins) | Write conflictResolver: compare updatedAt, apply win, log to AuditLog... | المخزون صحيح بعد تعارض، AuditLog مسجل |
| 4.1 | الخادم | P0 | - | إعداد NestJS + PostgreSQL + Prisma | Generate NestJS app with Prisma, Auth, Sync modules, Swagger... | 
pm run start يعمل، API مستقر |
| 4.2 | الخادم | P0 | 4.1, 3.3 | API المزامنة (Push/Pull) | Implement /api/sync/push & /pull with JWT, delta cursor... | الـ Server يستقبل ويحفظ، Pull يعيد Delta |
| 4.3 | الموردين | P1 | 1.2, 4.1 | تصدير/استيراد فواتير الموردين | Build exportService (PDF/Excel) & importService (fuzzy match, update price)... | تصدير ناجح، استيراد يربط الأسماء، السعر يتحدث |
| 5.1 | التقارير | P1 | 4.1 | Dashboard مؤشرات يومية | Build Dashboard cards: sales, profit, low stock, expiry. Fetch daily... | البيانات تظهر، تحديث تلقائي |
| 6.1 | الأمان | P0 | 4.1 | نظام الدخول + RBAC | Implement JWT login, role guards, PIN support, cost hiding... | مساعد لا يرى التكلفة، دخول آمن |
| 6.2 | الأمان | P0 | 1.2, 6.1 | Audit Log غير قابل للتعديل | Ensure AuditLog append-only, verify encryption, log all stock/logins... | لا حذف/تعديل، سجلات كاملة |
| 6.3 | الإطلاق | P1 | كل ما سبق | حزم التثبيت + Beta Release | Configure electron-builder, generate installer, test on clean machines... | ملف .exe يعمل، تثبيت ناجح، جاهز للبيتا |

---

## 🗓️ 12. خارطة الطريق التطويرية (6 أسابيع)
| الأسبوع | التركيز | مخرجات قابلة للاختبار |
|--------|--------|---------------------|
| **1** | التأسيس + DB محلي + واجهة POS خام | تشغيل التطبيق، بحث دواء، سلة وهمية، هيكل مجلدات جاهز |
| **2** | منطق البيع + خصم مخزون + طباعة فاتورة | إتمام بيع حقيقي محلياً، خصم تلقائي، فاتورة HTML قابلة للطباعة |
| **3** | المزامنة الأوفلاين + Queue + Sync Logic | بيع بدون إنترنت → مزامنة تلقائية عند العودة، حل تعارض أساسي |
| **4** | Dashboard + تنبيهات + تقارير أساسية | لوحة المالك تعمل، تصدير PDF/Excel، تنبيهات المخزون والصلاحية |
| **5** | RBAC + أمان + Audit Log + إعدادات المالك | دخول متعدد، صلاحيات دقيقة، تشفير محلي، سجل تدقيق كامل |
| **6** | تحسينات + اختبار بيتا + حزم التثبيت | ملف .exe جاهز، اختبار على 5 صيدليات، جمع ملاحظات، إطلاق عام |

---

## ✅ 13. معايير القبول النهائية (Definition of Done)
- ✅ كل عملية بيع تُسجل محلياً في < 1 ثانية، ولا تُسمح ببيع دواء منتهي الصلاحية أو تحت الصفر
- ✅ المزامنة لا تفقد بيانات حتى مع انقطاع متكرر، وتتعامل مع التعارض بـ Last-Write-Wins + تسجيل في AuditLog
- ✅ النظام يعمل بسلاسة على جهاز بـ 4GB RAM و Windows 10/11
- ✅ كود مكتوب بـ TypeScript، مُختبر بنسبة ≥ 60%، وموثق بـ JSDoc
- ✅ واجهة المستخدم لا تتطلب تدريباً مسبقاً للكاشير، وإتمام البيع < 10 ثواني
- ✅ جميع الـ Prompts والـ Tasks متزامنة مع Beads، ولا توجد معلقة في Backlog دون سبب

---

## ⚠️ 14. إدارة المخاطر والتخفيف
| الخطر | التأثير المحتمل | استراتيجية التخفيف |
|------|----------------|-------------------|
| تعارض المزامنة المتكرر | فقدان كمية دواء أو بيع مكرر | AuditLog إجباري + Last-Write-Wins + مراجعة يدوية للنزاعات الأسبوعية |
| ضعف أداء Electron على أجهزة قديمة | بطء الواجهة أو استهلاك ذاكرة عالي | استخدام etter-sqlite3 مباشر، تقليل WebWorkers، تجنب Animations ثقيلة |
| كود AI غير متسق أو به ثغرات خفية | أعطال وقت التشغيل أو أمان ضعيف | Prompt Modularity، مراجعات يدوية أسبوعية، اختبارات وحدة إلزامية قبل الدمج |
| اعتماد الصيادلة على واتساب يدوياً | صعوبة تبني بوابة الموردين | التركيز على تصدير/استيراد Excel/PDF أولاً، ثم تطوير البوابة التلقائية لاحقاً |
| فقدان الجهاز المحلي | ضياع بيانات الصيغة غير المزمنة | استراتيجية نسخ احتياطي هجين: محلي فوري + سحابي مشفر عند أول اتصال |

---

## 🚀 15. خطوات البدء الفوري
1. **حفظ الوثيقة**: انسخ هذا الملف كاملاً واحفظه باسم PRD_Pharmacy_SaaS_Iraq.md في جذر مشروعك.
2. **إعداد المستودع**: 
   git init pharmacy-saas-iraq
   cd pharmacy-saas-iraq
   git add .
   git commit -m "📄 Initial PRD commit - Offline-First Pharmacy SaaS for Iraq"
3. **فتح Beads**: أنشئ Workspace جديد، أضف الـ 6 Epics، وأنشئ المهام حسب الجدول. فعّل Chain Mode.
4. **بدء المهمة 1.1**: انسخ الـ Prompt الخاص بها إلى OpenCode، راجع المخرجات، اختبرها، ثم علّمها Done.
5. **التكرار**: انتقل للمهمة التالية فقط بعد تحقيق Acceptance Criteria. لا تتجاوز التبعيات.
6. **التوثيق**: أضف أي ملاحظة تقنية أو تعديل في PRD_Pharmacy_SaaS_Iraq.md مع git commit واضح.

---
📜 **وثيقة حية:** يتم تحديث هذا الملف عند أي تغيير في المتطلبات أو اكتشاف عقبة تقنية أثناء التطوير.  
🤖 **نصيحة الخبير:** الذكاء الاصطناعي مضخم إنتاجية، لكنك المهندس المسؤول عن المنطق، الأمان، وجودة الكود. راجع كل ما يولده، افهمه، ولا تدمج ما لا تفهمه. النجاح في SaaS يعتمد على **الاستمرارية، المراجعة، والتكرار السريع**.

ابدأ الآن. أنا معك عند كل عقدة تقنية أو Prompt تحتاج تحسيناً. 🛠️✨