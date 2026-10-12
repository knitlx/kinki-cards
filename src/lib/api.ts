export const json = (data: unknown, status = 200) =>
  Response.json(data, { status });

export const err = (message: string, status = 400) =>
  Response.json({ error: message }, { status });

export function isHost(req: Request, hostSecret: string) {
  return req.headers.get("x-host-secret") === hostSecret;
}

export const randomSecret = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");
