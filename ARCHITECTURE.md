# ARCHITECTURE — G2G 홈페이지

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.5 (변경 이력은 §14) |
| 작성일 | 2026-10-13 |
| 관련 문서 | [PRD.md](./PRD.md), [CONVENTIONS.md](./CONVENTIONS.md) |

---

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js (App Router, 최신 안정 버전)** | SSG/ISR로 SEO·AEO에 유리, Metadata API로 메타·스키마 관리 |
| 언어 | **TypeScript** (`strict`) | 콘텐츠 스키마부터 컴포넌트까지 타입 안전성 확보 |
| 스타일 | **Tailwind CSS v4** + CSS 변수 디자인 토큰(`app/globals.css`의 `@theme`) | 빠른 개발, 일관된 토큰. v4는 `tailwind.config` 없이 CSS에서 토큰을 정의한다 |
| UI 프리미티브 | shadcn/ui (Radix 기반) | 접근성이 갖춰진 컴포넌트를 코드로 소유 |
| 콘텐츠 | **MDX + Zod 스키마** (`/content`) + Git 기반 CMS 관리자 화면(§4.0) → v2에서 헤드리스 CMS 검토 | 초기 비용 0, Git으로 이력 관리, 비개발자도 웹에서 수정 |
| 폼 검증 | Zod + React Hook Form | 클라이언트·서버가 같은 스키마 사용 |
| DB (리드 저장) | Vercel Marketplace 연동 Postgres (Neon 또는 Supabase, 착수 시 하나로 확정) | 문의 데이터 보관. Vercel Postgres는 더 이상 제공되지 않는다 |
| 레이트리밋 저장소 | Upstash Redis (Marketplace) | 서버리스 인스턴스 간 카운터 공유. **필수** |
| 비공개 파일 | Vercel Blob (private) | 소개서 PDF 보관 (C-04, P1) |
| 이메일 | Resend | 문의 알림 |
| 알림 | Slack Incoming Webhook (선택: 카카오 알림톡) | 영업팀 즉시 대응 |
| 분석 | GA4, 네이버 애널리틱스, Vercel Speed Insights | 전환·성능 측정 |
| 호스팅 | **Vercel** | Next.js 네이티브, 프리뷰 배포 |
| 패키지 매니저 | pnpm | |
| 테스트 | Vitest (단위), Playwright (E2E) | |
| 린트/포맷 | ESLint + Prettier | |

---

## 2. 시스템 구성도

```
                ┌──────────────────────────────────────────┐
  사용자/        │                 Vercel                   │
  AI 크롤러 ───▶ │  라우팅 (next.config: 리다이렉트, 보안헤더) │
                │        │                                 │
                │        ▼                                 │
                │  Next.js App Router                      │
                │   ├─ 정적 페이지 (SSG): 메인, 서비스, 사례 │
                │   ├─ SSG: 인사이트 (CMS 도입 시 ISR)      │
                │   ├─ Route Handlers: sitemap, robots,    │
                │   │                  llms.txt            │
                │   └─ Server Action: 문의 제출 ─────────┐  │
                └────────────────────────────────────────┼─┘
                                                         │
                         ┌───────────────┬───────────────┼──────────────┐
                         ▼               ▼               ▼              ▼
                     Postgres         Resend          Slack       GA4 / 네이버
                    (leads 테이블)    (담당자 메일)    (알림)       (전환 이벤트, 클라이언트)
```

문의 제출 Server Action은 저장 전에 Upstash Redis로 레이트리밋을 검사한다. 소개서 PDF(P1)는 Vercel Blob(private)에 둔다.

---

## 3. 디렉터리 구조

```
.
├─ app/
│  ├─ (site)/                      # 공통 레이아웃(헤더/푸터) 적용 그룹
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                  # 메인
│  │  ├─ about/page.tsx
│  │  ├─ services/
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/page.tsx        # generateStaticParams
│  │  ├─ cases/ (page.tsx, [slug]/page.tsx)
│  │  ├─ insights/ (page.tsx, [slug]/page.tsx)
│  │  ├─ faq/page.tsx
│  │  ├─ partners/page.tsx
│  │  ├─ contact/
│  │  │  ├─ page.tsx
│  │  │  ├─ actions.ts             # 'use server' submitInquiry
│  │  │  └─ thanks/page.tsx        # noindex, 전환 이벤트는 여기서 쏘지 않는다 (§7.1)
│  │  ├─ careers/page.tsx
│  │  └─ (legal)/privacy, cookies
│  ├─ api/
│  │  ├─ brochures/[type]/route.ts # 토큰 검증 후 단기 다운로드 URL로 리다이렉트 (P1)
│  │  └─ cron/purge-leads/route.ts # 보유기간 지난 개인정보 파기 (Vercel Cron)
│  ├─ sitemap.ts
│  ├─ robots.ts
│  ├─ llms.txt/route.ts
│  ├─ opengraph-image.tsx          # 동적 OG 이미지
│  ├─ not-found.tsx
│  └─ layout.tsx                   # <html lang="ko">, 폰트, 전역 스키마
├─ components/
│  ├─ ui/                          # shadcn 프리미티브 (Button, Input…)
│  ├─ layout/                      # Header, Footer, MobileCtaBar, Breadcrumbs
│  ├─ sections/                    # Hero, StatsCounter, ServiceCards, CaseHighlights, FaqList, CtaBanner
│  ├─ seo/                         # JsonLd 컴포넌트
│  └─ forms/                       # InquiryForm, BrochureGate
├─ content/
│  ├─ services/*.mdx
│  ├─ cases/*.mdx
│  ├─ insights/*.mdx
│  ├─ faq/*.yaml
│  └─ site.ts                      # 회사 정보 단일 출처 (SSOT)
├─ lib/
│  ├─ content/                     # 로더 + Zod 스키마 (service.ts, case.ts, …)
│  ├─ seo/
│  │  ├─ metadata.ts               # buildMetadata()
│  │  └─ schema.ts                 # organization(), service(), faqPage(), article(), breadcrumb()
│  ├─ inquiry/                     # schema.ts, notify.ts, store.ts, rate-limit.ts
│  ├─ brochure/                    # schema.ts, token.ts(HMAC 서명·검증), store.ts (P1)
│  ├─ analytics.ts                 # track() 래퍼
│  └─ env.ts                       # 환경변수 Zod 검증
├─ public/
│  └─ images/                      # 소개서 PDF는 여기 두지 않는다 (Blob private)
├─ scripts/
│  └─ validate-content.ts          # frontmatter·참조 무결성·중복 slug 검사
├─ redirects.mjs                   # 기존 URL → 신규 URL 301 매핑
├─ security-headers.mjs            # 보안 헤더 정의 (next.config의 headers()에서 사용)
├─ proxy.ts                        # 스테이징 Basic Auth 전용 (Next.js 16의 middleware 후속)
├─ tests/ (unit/, e2e/)
└─ PRD.md, ARCHITECTURE.md, CONVENTIONS.md   # 문서는 저장소 루트에 둔다
```

---

## 4. 콘텐츠 모델

모든 콘텐츠는 `/content`의 MDX(frontmatter) 또는 YAML로 관리하고, `lib/content`의 Zod 스키마로 **빌드 시 검증**한다. 검증에 실패하면 빌드도 실패한다.

### 4.0 편집 방식 (비개발자 운영)

PRD §7의 운영 요구사항("비개발자가 웹 화면에서 수정")은 v1에서 **Git 기반 CMS 관리자 화면**으로 충족한다.

- 관리자 화면에서 저장하면 `/content`의 MDX·YAML 파일이 커밋되고, PR 프리뷰를 거쳐 배포된다. 콘텐츠 저장 위치와 Zod 검증은 그대로다.
- 후보는 Keystatic이다. 채택 전에 사용 중인 Next.js 버전과의 호환성을 확인한다.
- 호환되지 않거나 G2G가 원하지 않으면, 비개발자는 수정 요청만 하고 개발팀이 반영하는 방식으로 낮춘다(PRD §10 미결).
- 관리자 화면은 인증으로 보호하고 `robots.ts`에서 차단한다.

### 4.1 Site (SSOT) — `content/site.ts`

```ts
export const site = {
  name: '굿투그레이트',
  legalName: '㈜굿투그레이트',
  alternateNames: ['GOOD TO GREAT', 'G2G', 'GTOG'],
  url: 'https://gtog2024.co.kr',
  phone: '070-8831-7081',
  address: {
    street: '두텁바위로 59-1, 지층 에프-12호',
    locality: '용산구',
    region: '서울특별시',
    country: 'KR',
  },
  bizRegNo: '134-88-03195',
  ecommerceRegNo: '2024-서울용산-1282',
  privacyOfficer: '심재찬',
  sameAs: [] as string[],        // TODO: 블로그·인스타·유튜브 등
  kakaoChannel: '',              // TODO
} as const;
```

> 회사 정보는 반드시 이 파일에서만 가져온다. 푸터, 스키마, 연락처 링크를 모두 여기서 파생한다.
> 전화 링크는 `phone`에서 숫자만 남겨 만든다(`tel:07088317081`). 화면 표시는 `070-8831-7081` 그대로 쓴다.

### 4.2 Service

```ts
const Service = z.object({
  slug: z.string(),
  title: z.string(),                  // "플레이스 마케팅". H1에 그대로 쓴다
  category: z.enum(['ai', 'search', 'viral', 'influencer', 'ads']), // 메인 H-05의 5개 그룹
  featured: z.boolean().default(false), // 메인 주력 카드 노출
  order: z.number(),
  summary: z.string().max(200),       // TL;DR 2~3문장 (화면 요약 박스)
  description: z.string().min(80).max(120), // meta description 전용
  forWhom: z.array(z.string()),
  process: z.array(z.object({ step: z.string(), desc: z.string() })),
  pricing: z.string().optional(),
  faqIds: z.array(z.string()),        // faq/*.yaml 참조
  relatedServices: z.array(z.string()).default([]),
  updatedAt: z.coerce.date(),
});
```

### 4.3 Case

```ts
const Case = z.object({
  slug: z.string(),
  title: z.string(),
  client: z.string(),                 // 익명 가능: "서울 소재 F&B 브랜드"
  industry: z.string(),
  services: z.array(z.string()),      // Service.slug 참조
  metrics: z.array(z.object({ label: z.string(), before: z.string(), after: z.string() })),
  period: z.string(),
  summary: z.string().max(200),
  description: z.string().min(80).max(120),
  author: z.string().default('굿투그레이트'), // Article 스키마용
  cover: z.string(),                  // Article 스키마의 image
  featured: z.boolean().default(false),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),         // sitemap lastModified, dateModified
});
```

### 4.4 Insight (Article)

`slug, title, summary, description, author, category, tags[], publishedAt, updatedAt, cover`

- `summary`(TL;DR, 200자 이내)와 `description`(메타, 80~120자)의 구분은 Service·Case와 같다.

### 4.5 FAQ — `content/faq/*.yaml`

```yaml
- id: cost-place-01
  category: cost
  services: [place]
  updatedAt: 2026-10-13
  question: 플레이스 마케팅 비용은 얼마인가요?
  answer: |
    첫 문장에 직접 답한다. …
```

- 항목마다 `updatedAt`(ISO 날짜)을 둔다. `/faq`의 sitemap `lastModified`는 그중 가장 최근 값이다.
- `/faq`, 서비스 상세, 메인이 **같은 FAQ 데이터**를 참조한다.
- `FAQPage` 마크업 위치는 질문당 한 곳이다. `services`가 있으면 첫 번째 서비스의 상세 페이지, 없으면 `/faq`다(§6.2).
- 참조 무결성(`faqIds`, `services`, `relatedServices`)은 빌드 스크립트로 검사한다.

---

## 5. 렌더링 전략

| 경로 | 방식 | 비고 |
|---|---|---|
| `/`, `/about`, `/services/**`, `/cases/**`, `/faq` | **SSG** | 콘텐츠가 Git에 있으므로 배포 = 갱신 |
| `/insights`, `/insights/[slug]` | SSG (+ CMS 도입 시 ISR `revalidate`) | |
| `/contact` | SSG + Server Action | `?service=`는 클라이언트에서 읽는다(페이지를 동적으로 만들지 않는다) |
| `sitemap.xml`, `robots.txt`, `llms.txt` | 빌드 시 생성 | |
| `/api/brochures/[type]`, `/api/cron/*` | 동적 (Route Handler) | |

- Next.js 16.4의 Cache Components를 켜고, `app/(site)/layout.tsx`에서 `ensureStatic = 'navigation'`을 export한다. 이 그룹의 페이지에 요청 시점 렌더링(`cookies()`, `headers()`, 서버 `searchParams`, 캐시되지 않은 fetch)이 섞이면 빌드가 실패한다.
- Cache Components에서는 `generateStaticParams`가 빈 배열을 반환할 수 없다. 사례·인사이트가 0건이면 `staticSlugs()`가 존재하지 않는 slug 하나를 반환하고 페이지는 404로 응답한다.
- 클라이언트 컴포넌트(`'use client'`)는 인터랙션이 필요한 곳(폼, 카운터 애니메이션, 모바일 메뉴, 필터)에만 쓴다.
- 핵심 텍스트 콘텐츠는 반드시 서버 HTML에 포함되어야 한다. AI 크롤러 상당수는 JS를 실행하지 않는다.

---

## 6. SEO / AEO 레이어

### 6.1 메타데이터

- `lib/seo/metadata.ts`의 `buildMetadata({ title, description, path, image })`로 모든 페이지 메타를 생성한다.
- title 템플릿: `%s | 굿투그레이트 G2G`
- canonical은 `path` 기반으로 자동 생성한다.

### 6.2 구조화 데이터 (JSON-LD)

| 페이지 | 스키마 |
|---|---|
| 전역(layout) | `Organization` + `ProfessionalService`(LocalBusiness), `WebSite` |
| 서비스 상세 | `Service`, `FAQPage`(해당 서비스 전용 질문만), `BreadcrumbList` |
| 사례 상세 | `Article`, `BreadcrumbList` |
| 인사이트 상세 | `Article`(BlogPosting), `BreadcrumbList` |
| FAQ | `FAQPage`(서비스 전용이 아닌 질문만), `BreadcrumbList` |
| 메인 | 전역 스키마만. FAQ는 화면에만 노출 |

- 같은 질문을 여러 페이지에서 `FAQPage`로 마크업하지 않는다. 마크업 대상은 화면에 보이는 FAQ의 부분집합이어도 된다.
- `lib/seo/schema.ts`의 순수 함수로 생성하고 `<JsonLd data={...} />` 컴포넌트로 렌더링한다.
- 스키마 값은 화면에 보이는 콘텐츠와 일치해야 한다. 보이지 않는 FAQ를 스키마에만 넣지 않는다.
- 각 스키마 함수의 출력은 단위 테스트에서 스냅샷으로 검증한다.

### 6.3 크롤링 파일

- `robots.ts`: 전체 허용, `/contact/thanks`·`/api` 차단, sitemap 경로 명시. AI 크롤러(GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Yeti 등)를 명시적으로 허용한다.
- `sitemap.ts`: content 로더에서 생성하고, `lastModified`에는 각 콘텐츠의 `updatedAt`을 쓴다.
- `llms.txt`: `site.ts`와 서비스 목록에서 자동 생성한다(회사 개요 → 서비스별 한 줄 요약과 URL → FAQ·사례 링크).

### 6.4 리다이렉트

- `redirects.mjs`에 기존 URL → 신규 URL을 `permanent: true`로 매핑하고 `next.config`에서 불러온다.
- 런칭 전에 기존 URL 전체 목록을 대상으로 E2E 테스트를 돌려 상태 코드 301과 목적지를 확인한다.
- 기존 URL이 쿼리스트링으로 페이지를 구분하면(`?idx=12` 등) 경로만으로는 매핑할 수 없다. `has` 조건으로 쿼리 값을 매칭한다. 기존 플랫폼이 확인되면 방식을 확정한다(PRD §10).

---

## 7. 문의(리드) 파이프라인

### 7.1 문의 제출

```
InquiryForm (client, RHF + zod)
   │  submit
   ▼
submitInquiry (Server Action)
   1. honeypot 검사 → 봇이면 { ok: true, leadRef: null } 반환하고 종료
   2. rate limit (IP당 5회/10분, Upstash Redis)
   3. zod 서버 재검증 → 실패 시 { ok: false, fieldErrors }
   4. store: leads 테이블 insert
   5. notify: Resend 메일 + Slack (Promise.allSettled)
   6. 결과 반환
        저장 성공                → { ok: true, leadRef }   (알림 실패는 로그만)
        저장 실패 + 메일 성공     → { ok: true, leadRef }   (메일 제목에 [DB 저장 실패] 표시)
        저장 실패 + 메일 실패     → { ok: false, message }  (대표번호 안내)
   │
   ▼
InquiryForm (client)
   - leadRef가 있으면 track('generate_lead') 1회 (sessionStorage에 leadRef를 기록해 중복 방지)
   - router.push('/contact/thanks')
```

- Server Action은 `redirect()`하지 않고 결과 객체를 반환한다(CONVENTIONS §10). 전환 이벤트는 **성공 응답을 받은 클라이언트**에서만 발생하므로, 완료 페이지에 직접 들어오거나 새로고침해도 전환이 늘지 않는다.
- `leadRef`는 무작위 식별자다. 개인정보를 담지 않는다.
- 레이트리밋은 인스턴스 메모리로 구현하지 않는다. 서버리스에서는 인스턴스마다 카운터가 따로 돌아 제한이 걸리지 않는다.
- KPI G1의 문의 수는 `leads` 건수를 기준값으로 쓴다. 쿠키 동의를 거부한 방문자는 GA4에 잡히지 않는다.

### 7.2 소개서 다운로드 (C-04, P1)

```
BrochureGate (client) ─ 이메일 + 동의
   ▼
requestBrochure (Server Action)
   1. honeypot, rate limit, zod 검증
   2. brochure_leads insert (email, type, consent_at, utm…)
   3. HMAC 서명 토큰 생성 (type + 만료 24시간)
   4. Resend로 다운로드 링크 발송: /api/brochures/{type}?token=…
   ▼
GET /api/brochures/[type]
   토큰 검증 → Blob(private)의 단기 유효 URL로 302
```

- PDF를 `public/`에 두지 않는다. 공개 경로에 있으면 URL만으로 받을 수 있어 게이트가 무의미하다.
- 함수 응답 본문에는 크기 제한(4.5MB)이 있으므로 Route Handler에서 PDF를 직접 내려보내지 않고 스토리지 URL로 리다이렉트한다.
- 링크를 메일로 보내므로 이메일 주소의 유효성도 함께 확인된다.

### 7.3 leads 테이블

| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| created_at | timestamptz | |
| name, company, phone, email | text | 개인정보 |
| services | text[] | |
| budget | text | |
| message | text | |
| utm_source / medium / campaign | text | |
| landing_path, referrer | text | |
| consent_at | timestamptz | 동의 시각 |
| status | enum(new, contacted, won, lost) | 어드민에서 변경 (신규·상담중·계약·종료) |
| memo | text | 어드민 내부 메모 |
| updated_at | timestamptz | 어드민 마지막 수정 시각 |

- `brochure_leads` 테이블(P1): `id, created_at, email, type, consent_at, utm_*, landing_path`.
- 개인정보 보유기간이 지나면 파기한다. 기간은 개인정보처리방침의 고지 기간과 일치시키고(PRD §10 미결), Vercel Cron이 `/api/cron/purge-leads`를 매일 호출해 처리한다. 이 경로는 `CRON_SECRET`으로 보호한다.
- DB 접근 키는 서버에서만 쓴다. 클라이언트에 노출하지 않는다.
- DB는 Vercel Marketplace의 Neon(싱가포르)이다. 스키마는 `db/schema.sql`(멱등)이고 `pnpm db:migrate`로 적용한다.
- 현재 Production과 Preview가 같은 DB를 쓴다. 프리뷰에서 문의를 제출하면 운영 데이터에 들어간다.

### 7.4 문의 관리 어드민 (`/admin`)

- 문의 목록(검색·상태 필터·페이지), 상세(상태·내부 메모 수정), 삭제(개인정보 삭제 요청 처리용), CSV 내보내기(BOM 포함, 수식 인젝션 방지).
- 인증: 아이디·비밀번호. 계정은 환경 변수 `ADMIN_ACCOUNTS`(`아이디:scrypt해시`, 콤마 구분)에 둔다. 해시는 `pnpm admin:hash`로 만든다.
- 세션: HMAC 서명 쿠키 `g2g_admin`(httpOnly, Secure, SameSite=Lax, path=/admin, 8시간). 서버에 상태를 두지 않으며 `ADMIN_SESSION_SECRET`을 바꾸면 모든 세션이 끊긴다.
- 로그인은 IP당 10회/15분으로 제한한다(Upstash).
- 페이지·Server Action·Route Handler가 모두 데이터 접근 전에 세션을 직접 확인한다(`lib/admin/auth.ts`, `lib/admin/leads.ts`). 개인정보이므로 캐시하지 않는다.
- 세션 확인은 쿠키를 먼저 읽고 `connection()`을 호출한다. 그렇지 않으면 빌드 때 로그인 리디렉트가 프리렌더로 고정된다.
- `/admin`은 `noindex` 헤더·메타, `robots.txt` 차단, `Cache-Control: private, no-store`. 쿠키 배너·분석·유입 추적·조직 스키마는 `(site)` 레이아웃에만 있어 어드민에는 실리지 않는다.

---

## 8. 분석 & 이벤트

`lib/analytics.ts`의 `track(event, params)` 래퍼 하나로 GA4와 네이버에 동시에 전송한다.

| 이벤트 | 트리거 |
|---|---|
| `generate_lead` | 문의 제출 성공 응답 수신 시 1회 (§7.1) |
| `click_call` | `tel:` 클릭 |
| `click_kakao` | 카카오 상담 클릭 |
| `download_brochure` | 소개서 다운로드 (`type` 파라미터) |
| `cta_click` | 주요 CTA (`location` 파라미터) |

- 쿠키 동의 전에는 분석 스크립트를 로드하지 않는다(Consent Mode).

---

## 9. 환경 변수

`lib/env.ts`에서 Zod로 검증한다. 서버 변수는 기능별(database, mail, slack, rateLimit, cron, admin)로 나눠 검증하므로, 한 기능의 키가 없어도 다른 기능은 동작한다. 예: DB만 있으면 문의는 저장되고 알림만 실패한다. 목록과 설명은 `.env.example`이 기준이다.

- 빌드 전 `pnpm validate`가 기능별 설정 여부를 출력한다. 기본은 경고만 하고, `STRICT_ENV=1`이면 하나라도 빠졌을 때 빌드가 실패한다. 서버 키를 모두 등록한 뒤 Production에 `STRICT_ENV=1`을 설정한다.
- Marketplace 연동이 주입하는 이름을 그대로 쓴다: Neon → `DATABASE_URL`, Upstash → `KV_REST_API_URL`·`KV_REST_API_TOKEN`(`RATE_LIMIT_REDIS_*`가 없으면 이 값을 쓴다).
- `NEXT_PUBLIC_GA_ID`·`NEXT_PUBLIC_NAVER_ANALYTICS_ID`는 선택이다. 없으면 해당 스크립트를 싣지 않고, 둘 다 없으면 쿠키 배너도 숨긴다.

---

## 10. 보안

- 보안 헤더는 `next.config`의 `headers()`에서 정적으로 설정한다: `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- **CSP에 nonce를 쓰지 않는다.** nonce는 요청마다 값이 달라야 해서 모든 페이지가 동적 렌더링으로 바뀌고 SSG 전략(§5)이 깨진다. v1은 `script-src 'self' 'unsafe-inline'` + 분석 도메인 허용 목록으로 시작하고, `frame-ancestors`, `object-src 'none'`, `base-uri`, `form-action`은 엄격하게 둔다.
- `proxy.ts`(Next.js 16에서 `middleware.ts`를 대체)는 스테이징 Basic Auth에만 쓴다. Edge 런타임은 쓰지 않는다.
- 사용자 입력은 서버에서 재검증한다. 메일 본문은 텍스트로 이스케이프한다.
- 의존성 취약점은 Dependabot과 `pnpm audit`(CI)으로 점검한다.

---

## 11. 배포 & 환경

| 환경 | 브랜치 | URL |
|---|---|---|
| Preview | PR 브랜치 | Vercel 자동 프리뷰 (`noindex`) |
| Staging | `develop` | staging.gtog2024.co.kr (`noindex`, Basic Auth) |
| Production | `main` | gtog2024.co.kr |

**CI (GitHub Actions)**: `lint → typecheck → test(unit) → build(콘텐츠 검증 포함) → e2e(프리뷰 URL 대상) → Lighthouse CI(예산 미달 시 실패)`

- 프리뷰 배포에는 Vercel 배포 보호가 걸려 있다. E2E와 Lighthouse CI는 자동화용 보호 우회 시크릿(`x-vercel-protection-bypass` 헤더)으로 접근한다.
- 구현: `.github/workflows/ci.yml`(lint~build, `pnpm audit`), `.github/workflows/preview-checks.yml`(Vercel `deployment_status` 이벤트로 E2E·Lighthouse CI), `lighthouserc.cjs`. Lighthouse는 devtools 실측 제한(`throttlingMethod: 'devtools'`)을 쓴다. 기본 시뮬레이션은 `display: optional` 폰트를 텍스트 LCP의 선행 조건으로 계산해 LCP를 약 1초 길게 잡는다.

---

## 12. 성능 예산

| 항목 | 예산 |
|---|---|
| 첫 로드 JS (메인) | ≤ 120KB gzip |
| LCP 이미지 | `next/image` + `priority`, AVIF/WebP, ≤ 150KB |
| 웹폰트 | Pretendard 가변 폰트를 두 파일로 서브셋(`scripts/subset-font.py`): main(사이트에 쓰인 글자, preload, `display: optional`) + ext(나머지 KS X 1001 한글, preload 없음). `next/font/local` |
| 서드파티 스크립트 | `next/script` `strategy="afterInteractive"` 이상 지연, 동의 후 로드 |

---

## 13. 향후 확장 (v2+)

- 헤드리스 CMS(Sanity 등) 도입으로 마케터가 직접 사례·인사이트를 발행하고, 웹훅으로 ISR 갱신
- 다국어(`/en`, `/zh`): App Router `[locale]` 세그먼트와 `hreflang`
- 리드 관리 대시보드 (사내용, 인증 필요)

---

## 14. 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v0.1 | 2026-10-13 | 초안 |
| v0.2 | 2026-10-13 | 비개발자 편집 방식 추가(§4.0), 콘텐츠 모델 보강(`summary`/`description` 분리, Case·FAQ `updatedAt`, Case `author`·`cover`), FAQ 스키마 중복 제거(§6.2), 문의 파이프라인 재설계(결과 객체 반환, 클라이언트 전환 이벤트, 저장 실패 폴백), 소개서 다운로드 설계(§7.2), 레이트리밋 Redis 필수화, DB 후보 정정, `middleware.ts` → `next.config` 헤더 + `proxy.ts`, CSP 방침, Tailwind v4, 인사이트 렌더링 표기 통일, 문서 위치 정정 |
| v0.3 | 2026-10-14 | 구현 반영: `ensureStatic`으로 정적 출력 강제(§5), 환경 변수 `INQUIRY_FROM_EMAIL`·`LEAD_RETENTION_DAYS` 추가(§9). `components/ui`는 Radix 없이 네이티브 요소 기반의 shadcn 방식 프리미티브로 시작했다(아코디언은 `<details>`) |
| v0.4 | 2026-10-14 | 웹폰트를 main/ext 두 파일로 분리(§12), CI 워크플로·Lighthouse CI 설정 추가(§11) |
| v0.5 | 2026-10-14 | 대표 도메인 gtog2024.co.kr, Neon·Upstash 연결(§7.3), 문의 관리 어드민(§7.4), 환경 변수 기능별 검증(§9) |
