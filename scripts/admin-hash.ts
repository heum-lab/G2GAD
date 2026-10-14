// 어드민 비밀번호 해시 만들기. 입력한 비밀번호는 화면에 표시되지 않는다.
// 사용법: pnpm admin:hash
// 출력된 "아이디:해시"를 Vercel 환경 변수 ADMIN_ACCOUNTS에 넣는다(여러 명이면 콤마로 구분).
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { hashPassword } from '../lib/admin/password';

function ask(question: string, hidden = false) {
  const muted = new Writable({ write: (_chunk, _encoding, done) => done() });
  const rl = createInterface({
    input: process.stdin,
    output: hidden ? muted : process.stdout,
    terminal: true,
  });
  if (hidden) process.stdout.write(question);
  return new Promise<string>((resolve) =>
    rl.question(hidden ? '' : question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    }),
  );
}

async function main() {
  const username = (await ask('아이디: ')).trim();
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    throw new Error('아이디는 영문·숫자·._- 3~32자로 입력하세요.');
  }
  const password = await ask('비밀번호(12자 이상): ', true);
  if (password.length < 12) throw new Error('비밀번호는 12자 이상이어야 합니다.');
  const again = await ask('비밀번호 확인: ', true);
  if (password !== again) throw new Error('비밀번호가 일치하지 않습니다.');

  console.log(`\nADMIN_ACCOUNTS 값:\n${username}:${await hashPassword(password)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
