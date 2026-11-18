import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveServerConfig } from './serverConfig';

test('defaults to port 3000 and host 0.0.0.0 when env and argv are empty', () => {
  assert.deepEqual(resolveServerConfig([], {}), { port: 3000, host: '0.0.0.0' });
});

test('avoids colliding with NGINX_PORT when PORT matches NGINX_PORT', () => {
  const cfg = resolveServerConfig([], {
    PORT: '8080',
    NGINX_PORT: '8080',
    DEFAULT_APP_PORT: '3000',
  });
  assert.deepEqual(cfg, { port: 3000, host: '0.0.0.0' });
});

test('honors --port and --host CLI flags over environment variables', () => {
  const cfg = resolveServerConfig(['--port', '3199', '--host', '127.0.0.1'], {
    PORT: '8080',
    NGINX_PORT: '8080',
    HOST: '0.0.0.0',
  });
  assert.deepEqual(cfg, { port: 3199, host: '127.0.0.1' });
});

test('honors --port= and --host= syntax as well as -p shorthand', () => {
  assert.deepEqual(resolveServerConfig(['--port=4100', '--host=localhost'], {}), {
    port: 4100,
    host: 'localhost',
  });
  assert.deepEqual(resolveServerConfig(['-p', '4200'], {}), {
    port: 4200,
    host: '0.0.0.0',
  });
});

test('uses PORT env var when it does not collide with NGINX_PORT', () => {
  const cfg = resolveServerConfig([], {
    PORT: '4500',
    NGINX_PORT: '8080',
    DEFAULT_APP_PORT: '3000',
  });
  assert.deepEqual(cfg, { port: 4500, host: '0.0.0.0' });
});

test('ignores invalid CLI or env ports cleanly', () => {
  const cfg = resolveServerConfig(['--port', 'abc'], {
    PORT: '99999',
    DEFAULT_APP_PORT: '3000',
  });
  assert.deepEqual(cfg, { port: 3000, host: '0.0.0.0' });
});
