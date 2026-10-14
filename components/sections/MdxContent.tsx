import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { ComponentProps } from 'react';

// 본문 MDX 렌더링. 서버에서 HTML로 렌더링되므로 AI 크롤러가 그대로 읽을 수 있다.

function Anchor({ href = '', children, ...props }: ComponentProps<'a'>) {
  const className = 'text-primary underline underline-offset-2';
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}

const components = {
  h2: (props: ComponentProps<'h2'>) => (
    <h2 className="mt-12 text-2xl font-bold tracking-tight first:mt-0" {...props} />
  ),
  h3: (props: ComponentProps<'h3'>) => (
    <h3 className="mt-8 text-xl font-semibold" {...props} />
  ),
  p: (props: ComponentProps<'p'>) => <p className="mt-4 text-lg leading-8" {...props} />,
  ul: (props: ComponentProps<'ul'>) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-lg leading-8" {...props} />
  ),
  ol: (props: ComponentProps<'ol'>) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-lg leading-8" {...props} />
  ),
  strong: (props: ComponentProps<'strong'>) => (
    <strong className="font-semibold" {...props} />
  ),
  a: Anchor,
};

type MdxContentProps = {
  source: string;
};

export function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="max-w-prose">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
