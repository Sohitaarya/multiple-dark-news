export interface ServerConfig {
  port: number;
  host: string;
}

function parsePort(raw: string | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1 || n > 65535) return null;
  return n;
}

function readCliFlag(argv: string[], flag: string): string | undefined {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === flag && i + 1 < argv.length) {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) return next;
    }
    if (arg.startsWith(`${flag}=`)) {
      const val = arg.slice(flag.length + 1);
      if (val) return val;
    }
  }
  return undefined;
}

/**
 * Resolves the HTTP listen port and host deterministically for both local dev
 * and containerised Cloud Run/nginx environments where PORT=8080 == NGINX_PORT.
 */
export function resolveServerConfig(
  argv: string[] = process.argv.slice(2),
  env: Record<string, string | undefined> = process.env
): ServerConfig {
  const cliPort = parsePort(readCliFlag(argv, '--port') ?? readCliFlag(argv, '-p'));
  const envPort = parsePort(env.PORT);
  const nginxPort = parsePort(env.NGINX_PORT);
  const defaultAppPort = parsePort(env.DEFAULT_APP_PORT) ?? 3000;

  let port: number;
  if (cliPort !== null) {
    port = cliPort;
  } else if (envPort !== null && (nginxPort === null || envPort !== nginxPort)) {
    port = envPort;
  } else {
    port = defaultAppPort;
  }

  const cliHost = readCliFlag(argv, '--host')?.trim();
  const envHost = env.HOST?.trim();
  const host = cliHost || envHost || '0.0.0.0';

  return { port, host };
}
