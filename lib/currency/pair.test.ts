import { describe, expect, it } from "vitest";

import { resolveCryptoPricePair } from "./pair";

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("resolveCryptoPricePair", () => {
  it("accepts a catalog crypto id with a catalog fiat code", () => {
    expect(resolveCryptoPricePair(params("crypto=bitcoin&currency=USD"))).toEqual(
      { cryptoId: "bitcoin", currency: "USD" },
    );
  });

  it("rejects a crypto id outside the catalog", () => {
    expect(
      resolveCryptoPricePair(params("crypto=not-a-coin&currency=USD")),
    ).toBeNull();
  });

  it("rejects a fiat code outside the catalog", () => {
    expect(
      resolveCryptoPricePair(params("crypto=bitcoin&currency=XYZ")),
    ).toBeNull();
  });

  it("rejects a fiat code that is not in catalog casing", () => {
    expect(
      resolveCryptoPricePair(params("crypto=bitcoin&currency=usd")),
    ).toBeNull();
  });

  it("rejects a request missing either half of the pair", () => {
    expect(resolveCryptoPricePair(params("crypto=bitcoin"))).toBeNull();
    expect(resolveCryptoPricePair(params("currency=USD"))).toBeNull();
    expect(resolveCryptoPricePair(params(""))).toBeNull();
  });

  it("resolves only the pair it is given, ignoring extra parameters", () => {
    expect(
      resolveCryptoPricePair(
        params("crypto=bitcoin&currency=USD&ids=ethereum&vs_currencies=eur"),
      ),
    ).toEqual({ cryptoId: "bitcoin", currency: "USD" });
  });

  it("rejects caller-supplied URLs or provider query fragments", () => {
    expect(
      resolveCryptoPricePair(
        params("crypto=https://api.coingecko.com/api/v3/simple/price&currency=USD"),
      ),
    ).toBeNull();
    expect(
      resolveCryptoPricePair(params("crypto=../../x&currency=USD")),
    ).toBeNull();
  });
});
