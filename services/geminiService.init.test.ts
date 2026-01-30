import { GeminiService } from './geminiService';

describe('GeminiService initialization guard', () => {
  let service: GeminiService;
  let initCount: number;

  beforeEach(() => {
    service = new GeminiService();
    initCount = 0;

    // Spy on the private doInitialize by replacing it with a slow mock
    // that tracks how many times actual initialization runs
    const originalInit = (service as any).doInitialize.bind(service);
    (service as any).doInitialize = async () => {
      initCount++;
      // Simulate async work (network call to check API key)
      await new Promise((resolve) => setTimeout(resolve, 10));
      return originalInit();
    };
  });

  it('runs initialization exactly once for a single call', async () => {
    await service.initialize();
    expect(initCount).toBe(1);
  });

  it('returns the same promise for concurrent calls', async () => {
    const p1 = service.initialize();
    const p2 = service.initialize();
    const p3 = service.initialize();

    expect(p1).toBe(p2);
    expect(p2).toBe(p3);

    await Promise.all([p1, p2, p3]);
    expect(initCount).toBe(1);
  });

  it('reuses the cached promise on subsequent calls', async () => {
    await service.initialize();
    await service.initialize();
    await service.initialize();

    expect(initCount).toBe(1);
  });
});
