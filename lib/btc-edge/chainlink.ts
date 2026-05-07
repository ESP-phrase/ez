const CHAINLINK_RPC = "https://polygon-bor-rpc.publicnode.com";
const CHAINLINK_BTC_USD = "0xc907E116054Ad103354f2D350FD2514433D57F6f";

export type ChainlinkRound = { roundId: bigint; price: number; startedAt: number };

function parseChainlinkHex(hex: string): ChainlinkRound | null {
  if (!hex || hex.length < 320) return null;
  try {
    const roundId = BigInt("0x" + hex.slice(0, 64));
    const answer = BigInt("0x" + hex.slice(64, 128));
    const startedAt = Number(BigInt("0x" + hex.slice(128, 192)));
    const price = Number(answer) / 1e8;
    if (price <= 0 || !isFinite(price)) return null;
    return { roundId, price, startedAt };
  } catch {
    return null;
  }
}

async function rpcCall(data: string): Promise<string | null> {
  try {
    const res = await fetch(CHAINLINK_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", method: "eth_call",
        params: [{ to: CHAINLINK_BTC_USD, data }, "latest"],
        id: 1,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: string };
    return json.result?.slice(2) ?? null;
  } catch {
    return null;
  }
}

export async function fetchChainlinkLatestRound(): Promise<ChainlinkRound | null> {
  const hex = await rpcCall("0xfeaf968c");
  return hex ? parseChainlinkHex(hex) : null;
}

export async function fetchChainlinkRound(roundId: bigint): Promise<ChainlinkRound | null> {
  const padded = roundId.toString(16).padStart(64, "0");
  const hex = await rpcCall("0x9a6fc8f5" + padded);
  return hex ? parseChainlinkHex(hex) : null;
}

export async function fetchChainlinkPrice(): Promise<number | null> {
  const r = await fetchChainlinkLatestRound();
  return r?.price ?? null;
}

// Returns the Chainlink price that was active at `targetSec` by walking rounds backwards.
// This is the authoritative opening price for a 5-minute Polymarket window.
export async function fetchChainlinkPriceAt(targetSec: number): Promise<number | null> {
  const latest = await fetchChainlinkLatestRound();
  if (!latest) return null;

  if (latest.startedAt <= targetSec) return latest.price;

  let roundId = latest.roundId - 1n;
  for (let i = 0; i < 25; i++) {
    if (roundId <= 0n) break;
    const round = await fetchChainlinkRound(roundId);
    if (!round) break;
    if (round.startedAt <= targetSec) return round.price;
    roundId = roundId - 1n;
  }
  return null;
}
