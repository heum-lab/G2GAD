import type { JsonLdObject } from '@/lib/seo/schema';

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

// 실행 코드가 아닌 구조화 데이터이므로 next/script가 아니라 네이티브 <script>를 쓴다.
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
