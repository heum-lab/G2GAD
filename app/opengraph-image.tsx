import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

// 기본 OG 이미지: BI(흰색) + 라틴 표기. 한글 폰트를 따로 싣지 않으므로 라틴 표기만 쓴다.

export const alt = `${site.name} (GOOD TO GREAT) 로고`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 모듈 최상위에서 읽어야 빌드 시 정적으로 생성된다.
const logoSrc = `data:image/png;base64,${await readFile(
  join(process.cwd(), 'public/brand/logo-white.png'),
  'base64',
)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b1220',
        color: '#b4bccb',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse는 <img>만 지원한다 */}
      <img src={logoSrc} alt="" width={608 * 0.75} height={338 * 0.75} />
      <div style={{ marginTop: 56, fontSize: 36 }}>AEO · GEO · AI Marketing Agency</div>
    </div>,
    size,
  );
}
