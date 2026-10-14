// 기존 URL → 신규 URL 301 매핑. (ARCHITECTURE §6.4, PRD I-01)
// TODO: 기존 사이트 플랫폼과 전체 URL 목록이 확보되면 채운다. (PRD §10 미결)
// 기존 URL이 쿼리스트링으로 페이지를 구분하면 `has` 조건으로 매칭한다.
//
// 예:
// { source: '/board/view', has: [{ type: 'query', key: 'idx', value: '12' }],
//   destination: '/insights/some-slug', permanent: true },

/** @type {Awaited<ReturnType<NonNullable<import('next').NextConfig['redirects']>>>} */
export const redirects = [];
