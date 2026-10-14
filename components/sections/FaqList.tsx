import type { Faq } from '@/lib/content/schemas';

type FaqListProps = {
  faqs: Pick<Faq, 'id' | 'question' | 'answer'>[];
  headingLevel?: 'h3' | 'h4';
};

/**
 * FAQ 아코디언. <details>를 쓰므로 접힌 답변도 서버 HTML에 그대로 있다. (CONVENTIONS §1)
 * FAQPage 스키마는 여기서 넣지 않는다. 마크업 위치는 페이지가 정한다. (ARCHITECTURE §6.2)
 */
export function FaqList({ faqs, headingLevel: Heading = 'h3' }: FaqListProps) {
  return (
    <div className="divide-border border-border max-w-prose divide-y border-y">
      {faqs.map((faq) => (
        <details key={faq.id} className="group py-1">
          <summary className="flex items-start justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <Heading className="text-lg font-semibold">{faq.question}</Heading>
            <span
              aria-hidden="true"
              className="text-muted-foreground mt-0.5 text-2xl leading-none transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="text-muted-foreground space-y-3 pb-5 text-lg leading-8">
            {faq.answer.split(/\n+/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
