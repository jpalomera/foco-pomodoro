import { mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });

const files = {
  '/': await readFile('index.html', 'utf8'),
  '/index.html': await readFile('index.html', 'utf8'),
  '/styles.css': await readFile('styles.css', 'utf8'),
  '/app.js': await readFile('app.js', 'utf8'),
};

const server = `const files = ${JSON.stringify(files)};
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
export default {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    const body = files[path] ?? files['/'];
    const extension = path === '/' ? '.html' : path.slice(path.lastIndexOf('.'));
    return new Response(body, { headers: { 'content-type': types[extension] ?? types['.html'], 'cache-control': path === '/' ? 'no-cache' : 'public, max-age=3600' } });
  }
};
`;

await writeFile('dist/server/index.js', server);
await writeFile('dist/.openai/hosting.json', JSON.stringify({
  project_id: 'appgprj_6a5a2f121b4481918200cf33064b7703'
}, null, 2));

