// SSE: Chainlink BTC/USD every 2s. priceToBeat and odds fetched from Polymarket once per window.

import { fetchChainlinkPrice } from "@/lib/btc-edge/chainlink";
import { fetchWindowOdds, fetchWindowPriceToBeat } from "@/lib/btc-edge/polymarket";

export async function GET() {
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const getWindowStart = () => Math.floor(Math.floor(Date.now() / 1000) / 300) * 300;

      type OddsShape = { upPrice: number; downPrice: number };

      let lastWindow = -1;
      let cachedPriceToBeat: number | null = null;
      // Use a box object so TS doesn't narrow through closure analysis
      const oddsBox: { value: OddsShape | null } = { value: null };

      const refreshWindowData = async () => {
        const ws = getWindowStart();
        if (ws !== lastWindow) {
          // New window — reset so we retry both values
          lastWindow = ws;
          cachedPriceToBeat = null;
          oddsBox.value = null;
        }
        // Keep retrying each tick until both values are obtained
        const fetches: Promise<void>[] = [];
        if (cachedPriceToBeat === null)
          fetches.push(fetchWindowPriceToBeat(ws).then((v) => { if (v !== null) cachedPriceToBeat = v; }));
        if (oddsBox.value === null)
          fetches.push(fetchWindowOdds(ws).then((v) => { if (v) oddsBox.value = v as OddsShape; }));
        if (fetches.length) await Promise.all(fetches);
      };

      // Seed
      await refreshWindowData();
      const chainlink = await fetchChainlinkPrice();
      send({
        chainlinkPrice: chainlink,
        priceToBeat: cachedPriceToBeat,
        upPrice: oddsBox.value?.upPrice ?? null,
        downPrice: oddsBox.value?.downPrice ?? null,
        ts: Date.now(),
      });

      while (!closed) {
        await new Promise((r) => setTimeout(r, 2000));
        if (closed) break;

        await refreshWindowData();
        const cl = await fetchChainlinkPrice();

        send({
          chainlinkPrice: cl,
          priceToBeat: cachedPriceToBeat,
          upPrice: oddsBox.value?.upPrice ?? null,
          downPrice: oddsBox.value?.downPrice ?? null,
          ts: Date.now(),
        });
      }
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
