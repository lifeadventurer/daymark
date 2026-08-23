import { describe, expect, it } from "vitest";
import serviceWorkerSource from "../../public/sw.js?raw";

describe("service worker cache scoping", () => {
  it("uses the registration scope for app-shell URLs", () => {
    expect(serviceWorkerSource).toContain(
      'const APP_SCOPE = new URL("./", self.registration.scope);',
    );
    expect(serviceWorkerSource).toContain(
      'cache.put(appUrl("index.html"), responseCopy)',
    );
    expect(serviceWorkerSource).toContain('caches.match(appUrl("index.html"))');
    expect(serviceWorkerSource).not.toContain('cache.put("/index.html"');
  });
});
