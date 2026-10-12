export const json = (data: unknown, status = 200) =>
  Response.json(data, { status });

export const err = (message: string, status = 400) =>
  Response.json({ error: message }, { status });

export function isHost(req: Request, hostSecret: string) {
  return req.headers.get("x-host-secret") === hostSecret;
}

export function randomCode(len = 5) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export const randomSecret = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");
