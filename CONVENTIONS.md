# CONVENTIONS — G2G 홈페이지

코드, 콘텐츠, 협업 규칙. 사람과 AI 코딩 에이전트 모두 이 문서를 따른다.
관련 문서: [PRD.md](./PRD.md), [ARCHITECTURE.md](./ARCHITECTURE.md)
문서 버전: v0.2 (2026-10-13, 변경 이력은 §14)

---

## 1. 일반 원칙

1. **단일 출처(SSOT):** 회사 정보는 `content/site.ts`, FAQ는 `content/faq/*.yaml`에만 둔다. 하드코딩하거나 복붙하지 않는다.
2. **서버 우선:** 기본은 서버 컴포넌트다. `'use client'`는 상태나 이벤트가 필요한 가장 작은 컴포넌트에만 붙인다.
3. **콘텐츠는 HTML에:** 핵심 텍스트는 서버 렌더링 HTML에 있어야 한다. 탭이나 아코디언 안의 텍스트도 DOM에 존재해야 한다(`hidden` 토글은 가능, 지연 fetch는 불가).
4. **검증된 데이터만:** 외부 입력, 콘텐츠 frontmatter, 환경변수는 모두 Zod로 검증한다.

---

## 2. TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`
- `any`는 금지한다. 불가피하면 `unknown`을 쓰고 좁힌다.
- 타입은 Zod 스키마에서 파생한다: `type Service = z.infer<typeof ServiceSchema>`
- `interface`는 확장이 필요한 props에, 그 외에는 `type`을 쓴다.
- `enum` 대신 `as const` 객체나 유니온 리터럴을 쓴다.
- export는 named export만 쓴다. 단, Next.js가 요구하는 `page`, `layout` 등의 default export는 예외다.
- import 경로는 `@/` 절대 경로를 쓴다(`@/components/...`, `@/lib/...`).

---

## 3. 네이밍

| 대상 | 규칙 | 예 |
|---|---|---|
| 컴포넌트 파일 / 컴포넌트 | PascalCase | `ServiceCard.tsx` / `ServiceCard` |
| 그 외 TS 파일 | kebab-case | `rate-limit.ts` |
| 함수·변수 | camelCase | `buildMetadata`, `featuredServices` |
| 상수 | SCREAMING_SNAKE_CASE (모듈 수준 원시값) | `MAX_MESSAGE_LENGTH` |
| Zod 스키마 | `XxxSchema` | `InquirySchema` |
| 불리언 | `is/has/should` 접두사 | `isFeatured` |
| 이벤트 핸들러 | `handleXxx` (props는 `onXxx`) | `handleSubmit` |
| URL slug | 영문 소문자 kebab-case | `/services/reward-traffic` |
| 콘텐츠 파일 | `{slug}.mdx` | `content/services/place.mdx` |

> URL slug는 한 번 정하면 바꾸지 않는다. 바꿔야 하면 반드시 `redirects.mjs`에 301을 추가한다.

---

## 4. 컴포넌트

- 한 파일에 컴포넌트 하나를 둔다. 해당 파일에서만 쓰는 작은 하위 컴포넌트는 예외다.
- props 타입은 `XxxProps`로 이름 짓고 컴포넌트 바로 위에 선언한다.
- 레이어 의존 방향: `ui` ← `sections`/`forms`/`layout` ← `app`. 역방향 import는 금지한다.
- `sections/*`는 데이터를 props로 받는다. 데이터 로딩은 `page.tsx`에서 한다.
- 이미지는 반드시 `next/image`, 내부 링크는 반드시 `next/link`를 쓴다.
- 외부 링크에는 `target="_blank" rel="noopener noreferrer"`를 붙인다.

```tsx
type ServiceCardProps = {
  service: Pick<Service, 'slug' | 'title' | 'summary'>;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.slug}`} className="...">
      <h3 className="text-lg font-semibold">{service.title}</h3>
      <p className="text-muted-foreground">{service.summary}</p>
    </Link>
  );
}
```

---

## 5. 스타일 (Tailwind)

- 색상, 간격, 반경은 디자인 토큰(`app/globals.css`의 `@theme`에 정의한 CSS 변수)만 쓴다. Tailwind v4 기준이며 `tailwind.config` 파일은 만들지 않는다. 임의값(`text-[#123456]`, `mt-[13px]`)은 금지한다.
- 조건부 클래스는 `cn()`(clsx + tailwind-merge)으로 조합한다.
- 변형(variant)이 3개 이상이면 `cva`를 쓴다.
- 모바일 퍼스트로 작성한다. 기본 스타일이 모바일이고 `md:`, `lg:`로 확장한다.
- 클래스 정렬은 `prettier-plugin-tailwindcss`에 맡긴다.
- 폰트는 Pretendard를 쓰고, 본문은 최소 16px이다.

---

## 6. 시맨틱 HTML & 접근성

- **페이지당 `<h1>` 1개**, 제목 레벨은 건너뛰지 않는다(h2 → h4 금지).
- 랜드마크: `<header>`, `<nav>`, `<main>`, `<footer>`. 섹션에는 `<section aria-labelledby>`를 쓴다.
- **모든 `<Image>`에 `alt`를 넣는다.** 의미가 있으면 내용을 설명하고, 장식이면 `alt=""`로 둔다. ESLint `jsx-a11y`로 강제한다.
- 클릭 요소는 `<button>`이나 `<a>`만 쓴다. `div onClick`은 금지한다.
- 포커스 링을 제거하지 않는다(`focus-visible` 스타일 유지).
- 색 대비는 4.5:1 이상이다(큰 텍스트는 3:1).
- 폼: 모든 입력에 `<label>`을 연결하고, 에러는 `aria-describedby`로 연결하며, 필수 필드는 시각적 표시와 `aria-required`를 함께 쓴다.
- 전화번호는 항상 `tel:` 링크로 감싼다. 번호를 직접 적지 않고 `content/site.ts`의 `phone`에서 파생한다(링크는 숫자만 `tel:07088317081`, 표시는 `070-8831-7081`).

---

## 7. 콘텐츠 작성 규칙 (AEO/GEO)

### 7.1 구조

- **답변 우선:** H2 바로 다음 첫 문장에서 질문에 직접 답한다. 배경 설명은 그다음에 쓴다.
- **질문형 H2:** 서비스·인사이트 본문의 H2는 가능하면 사용자가 실제로 검색할 질문 형태로 쓴다.
  - ✅ "플레이스 마케팅은 효과가 얼마나 걸리나요?"
  - ❌ "효과 기간"
- **TL;DR:** 서비스, 사례, 인사이트 상단에 2~3문장 요약을 둔다(frontmatter `summary`, 200자 이내). 메타 설명은 별도 필드 `description`에 쓴다(§7.4).
- 한 문단에는 한 주장만 담는다. 문단은 3~4문장 이내로 쓴다.
- 비교나 수치는 표로 정리한다. AI가 인용하기 쉽다.

### 7.2 표기

- 회사명: 본문에서 처음 나올 때는 **"굿투그레이트(G2G)"**, 이후에는 "G2G"로 쓴다.
- 서비스명은 `content/services`의 `title`과 정확히 일치시킨다. `title`은 완성된 이름으로 쓰고("플레이스 마케팅", "검색광고"), 서비스 상세의 H1은 `title`을 그대로 쓴다. 템플릿에서 "마케팅"을 덧붙이지 않는다.
- 숫자는 아라비아 숫자와 단위를 쓰고, 기준일을 함께 적는다. 예: "누적 고객사 320곳(2026년 9월 기준)"
- 날짜: 화면에는 `2026. 10. 13.`, 데이터에는 ISO(`2026-10-13`)를 쓴다.
- 맞춤법: "비전"(○) / "비젼"(✕), "콘텐츠"(○) / "컨텐츠"(✕)

### 7.3 금지 표현 (광고 심의·플랫폼 정책)

- 성과 보장: "1위 보장", "100% 상위노출", "무조건"
- 근거 없는 최상급: "업계 최고", "국내 유일"(근거 자료가 있을 때만 출처와 함께 허용)
- 고객 실명과 로고는 **서면 동의를 받은 경우에만** 쓴다.

### 7.4 메타

- `title`: 30자 이내, 핵심 키워드를 앞에 둔다. 브랜드는 템플릿이 자동으로 붙인다.
- `description`: 80~120자, 페이지마다 고유하게 쓴다. Zod 스키마가 길이를 강제한다. `summary`를 메타 설명으로 재사용하지 않는다.
- 이미지 파일명은 영문 kebab-case로 짓는다(`place-marketing-process.webp`).

---

## 8. 구조화 데이터

- JSON-LD는 `lib/seo/schema.ts`의 함수로만 생성한다. 페이지에서 객체를 직접 작성하지 않는다.
- 스키마 내용은 **화면에 보이는 내용과 일치**해야 한다.
- `FAQPage`는 **질문 하나당 한 페이지에서만** 마크업한다. `services`가 지정된 질문은 첫 번째 서비스의 상세 페이지에서, 나머지는 `/faq`에서 마크업한다. 메인은 FAQ를 화면에만 보여 준다.
- 스키마 함수를 추가하거나 바꾸면 스냅샷 테스트를 갱신하고, PR에 Rich Results Test 결과 스크린샷을 첨부한다.

---

## 9. 폼 & 개인정보

- 클라이언트와 서버는 같은 Zod 스키마(`lib/inquiry/schema.ts`)를 쓴다.
- 개인정보(이름, 연락처, 이메일)는 `console.log`, 에러 리포팅, 분석 이벤트 파라미터에 넣지 않는다.
- 동의 체크박스는 기본 해제 상태이며 필수다. 동의 문구는 개인정보처리방침과 같은 내용을 쓴다.
- 쿼리스트링에 개인정보를 넣지 않는다.
- 게이트로 제공하는 파일(소개서 PDF 등)은 `public/`에 두지 않는다. 비공개 스토리지에 두고 서명된 만료형 링크로만 제공한다.
- 레이트리밋을 인스턴스 메모리(`Map` 등)로 구현하지 않는다. `lib/inquiry/rate-limit.ts`의 Redis 기반 구현을 쓴다.

---

## 10. 에러 처리

- Server Action은 `{ ok: true, ... } | { ok: false, fieldErrors?, message }` 형태로 반환하고, 예외를 클라이언트로 던지지 않는다. 성공 후 이동은 클라이언트가 `router.push`로 처리하며, Server Action 안에서 `redirect()`하지 않는다.
- 문의 제출의 성공 반환은 `{ ok: true, leadRef: string | null }`이다. 전환 이벤트는 `leadRef`가 있을 때만 클라이언트에서 1회 보낸다(ARCHITECTURE §7.1).
- 알림(메일, 슬랙)이 실패해도 DB 저장이 성공했으면 성공으로 응답한다. DB 저장이 실패해도 담당자 메일이 발송됐으면 성공으로 응답한다. 둘 다 실패한 경우에만 오류로 응답하고 대표번호를 안내한다. 실패는 개인정보를 뺀 채 서버 로그로 남긴다.
- 사용자 메시지는 한국어로, 해결 방법을 함께 쓴다. 예: "연락처 형식을 확인해 주세요. (예: 010-1234-5678)"

---

## 11. 테스트

| 종류 | 도구 | 대상 | 위치 |
|---|---|---|---|
| 단위 | Vitest | `lib/**` (스키마, SEO 함수, 콘텐츠 로더) | `tests/unit` |
| E2E | Playwright | 문의 제출, 모바일 CTA, 리다이렉트, 404 | `tests/e2e` |
| 콘텐츠 | 빌드 스크립트 | frontmatter 검증, 참조 무결성, 중복 slug | `scripts/validate-content.ts` |
| 품질 | Lighthouse CI | 메인, 서비스 1개, 문의 | CI |

- 버그를 고칠 때는 재현 테스트를 먼저 추가한다.
- 테스트 이름은 한국어로 써도 된다: `it('필수 필드 누락 시 에러를 표시한다')`

---

## 12. Git & 협업

### 브랜치

- `main`(운영), `develop`(스테이징)
- 작업 브랜치: `feat/`, `fix/`, `content/`, `chore/`, `docs/` + kebab-case 설명
  - 예: `feat/inquiry-form`, `content/case-cafe-brand`

### 커밋 (Conventional Commits)

```
<type>(<scope>): <요약, 한국어 가능, 50자 이내>

<본문: 왜 바꿨는지>
```

- type: `feat` `fix` `content` `style` `refactor` `perf` `test` `docs` `chore`
- 예: `feat(contact): 관심 서비스 쿼리스트링 자동 선택`
- 예: `content(cases): 카페 브랜드 플레이스 사례 추가`

### PR 체크리스트

```markdown
- [ ] lint / typecheck / test 통과
- [ ] 새 페이지: H1 1개, title·description 작성, breadcrumb
- [ ] 이미지 alt 작성
- [ ] 스키마 변경 시 Rich Results Test 통과 캡처
- [ ] slug/URL 변경 시 redirects.mjs 반영
- [ ] 모바일(360px) 화면 확인
- [ ] 금지 표현(§7.3) 미사용
- [ ] 개인정보 로그 미노출
```

- 리뷰어 1명 이상이 승인해야 머지한다. 머지 방식은 Squash merge다.

---

## 13. AI 코딩 에이전트 지침

에이전트(Claude Code 등)로 작업할 때 추가로 지킨다.

1. 작업 전에 `PRD.md`의 요구사항 ID(예: `F-02`)를 확인하고, 커밋과 PR 본문에 해당 ID를 적는다.
2. 새 의존성은 추가 이유를 PR에 쓴다. 같은 역할의 라이브러리가 이미 있으면 그것을 쓴다.
3. `content/site.ts`의 회사 정보, 실적 수치, 사례 수치는 **임의로 만들지 않는다.** 모르면 `TODO`로 남긴다.
4. 아키텍처 결정(디렉터리, 렌더링 방식, 외부 서비스)을 바꾸면 `ARCHITECTURE.md`도 같은 PR에서 갱신한다.
5. 완료를 보고하기 전에 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`를 실행해 통과를 확인한다.
6. 프레임워크·플랫폼 API는 기억에 의존하지 않고 설치된 버전의 공식 문서로 확인한다(예: Next.js 16의 `proxy.ts`, Tailwind v4의 `@theme`).

---

## 14. 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v0.1 | 2026-10-13 | 초안 |
| v0.2 | 2026-10-13 | Tailwind v4 토큰 위치(§5), 전화 링크를 `site.ts`에서 파생(§6), `summary`/`description` 분리와 H1 규칙(§7), FAQ 스키마 단일 마크업(§8), 게이트 파일·레이트리밋 규칙(§9), Server Action 반환 규약과 저장 실패 폴백(§10), 에이전트 지침 6번 추가(§13) |
