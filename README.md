# ONE+ Events — Website (V5, P0)

موقع static نظيف، صفر أطر عمل (لا React، لا Babel) — editorial-industrial، مبني على البروتوتايب المعتمد
`oneplus-v5-prototype.html`. مرجع البناء الحاكم: `WEBSITE_V5_BUILD_PLAN.md` + `ONEPLUS_WEBSITE_CONSTITUTION.md`.

## البنية
```
index.html              # الصفحة الرئيسية (single-page narrative)
work/{slug}/index.html  # صفحة مشروع فردية (UX-2) — JSON-LD لكل صفحة
data/projects.json      # بيانات المشاريع (client, event_type, area, media[]) — بلا تاريخ (WEB-09)
assets/css/site.css     # الأنماط المشتركة
assets/js/site.js       # سلوك الموقع: تبديل اللغة، Reveal on scroll، جلب المشاريع، إرسال Web3Forms
assets/img/             # صور المشاريع الحقيقية
robots.txt / sitemap.xml / CNAME / .nojekyll
```

## النشر
1. `git push` إلى `origin main` (repo: `3bdallah3del0/oneplus-site`).
2. Settings → Pages → main → / (root).
3. الدومين مضبوط عبر `CNAME` (`oneplusevents.com`).

## ملاحظات P0
- النموذج حيّ فعليًا عبر Web3Forms (المفتاح مضمّن في `assets/js/site.js`، هذا المفتاح public بتصميم الخدمة).
- زر المساعد الذكي معطّل عمدًا (تعليق HTML في `index.html`) — يُفعَّل في المرحلة P2 من الخطة.
- BoothCraft بطاقة "In development" فقط — غير مرتبط، حسب قرار المالك.
- بيانات `data/projects.json` (النوع/المنطقة) placeholder مؤقت؛ المزامنة الحقيقية من Drive هي المرحلة P3.
- صفحات `/work/{slug}/` مولَّدة من `data/projects.json` (سكربت توليد محلي، غير مُدرَج في المستودع).

## إضافة مشروع جديد يدويًا (قبل أتمتة P3)
1. أضف صورة إلى `assets/img/`.
2. أضف كائن جديد في `data/projects.json` (بدون تاريخ).
3. ولّد `work/{slug}/index.html` (نفس قالب الصفحات الحالية) وأضف رابطه إلى `sitemap.xml`.
