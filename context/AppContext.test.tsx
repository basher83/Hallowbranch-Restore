import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { AppProvider, useApp } from './AppContext';

const wrapper = ({ children }: { children: ReactNode }) => <AppProvider>{children}</AppProvider>;

const makeFile = (name = 'test.png') => new File(['pixels'], name, { type: 'image/png' });

describe('AppContext blob URL revocation', () => {
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let urlCounter: number;

  beforeEach(() => {
    urlCounter = 0;
    createObjectURL = vi.fn(() => `blob:http://localhost/${++urlCounter}`);
    revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;
  });

  it('creates a blob URL when starting a session', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => result.current.startSession(makeFile()));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(result.current.currentSession?.originalImageUrl).toBe('blob:http://localhost/1');
  });

  it('revokes old blob URLs when starting a new session over an existing one', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => result.current.startSession(makeFile('first.png')));
    const firstUrl = result.current.currentSession!.originalImageUrl;

    act(() => result.current.startSession(makeFile('second.png')));

    expect(revokeObjectURL).toHaveBeenCalledWith(firstUrl);
    expect(result.current.currentSession?.originalImageUrl).toBe('blob:http://localhost/2');
  });

  it('revokes blob URLs on resetSession', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => result.current.startSession(makeFile()));
    const sessionUrl = result.current.currentSession!.originalImageUrl;

    act(() => result.current.resetSession());

    expect(revokeObjectURL).toHaveBeenCalledWith(sessionUrl);
    expect(result.current.currentSession).toBeNull();
  });

  it('revokes old URLs when updateOriginalImage replaces them', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => result.current.startSession(makeFile()));
    const oldUrl = result.current.currentSession!.originalImageUrl;

    act(() =>
      result.current.updateOriginalImage(makeFile('cropped.png'), 'blob:http://localhost/new'),
    );

    expect(revokeObjectURL).toHaveBeenCalledWith(oldUrl);
    expect(result.current.currentSession?.originalImageUrl).toBe('blob:http://localhost/new');
  });

  it('revokes old base URL when updateBaseImage replaces a different one', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => result.current.startSession(makeFile()));
    // Set a distinct base URL so the guard (baseUrl !== originalUrl) allows revocation
    act(() => result.current.updateBaseImage(makeFile('base.png'), 'blob:http://localhost/base'));
    revokeObjectURL.mockClear();

    act(() => result.current.updateBaseImage(makeFile('base2.png'), 'blob:http://localhost/base2'));

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/base');
  });

  it('does not revoke base URL when it equals original URL (shared reference)', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => result.current.startSession(makeFile()));
    revokeObjectURL.mockClear();

    // baseImageUrl === originalImageUrl at this point, so updateBaseImage should NOT revoke
    act(() => result.current.updateBaseImage(makeFile('new.png'), 'blob:http://localhost/new'));

    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it('ignores non-blob URLs (data URLs from API responses)', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => result.current.startSession(makeFile()));
    // Simulate replacing with a data URL (from Gemini API response)
    act(() => result.current.updateOriginalImage(makeFile(), 'data:image/png;base64,abc'));

    // Should revoke the old blob URL, but not choke on the new data URL later
    const revokedUrls = revokeObjectURL.mock.calls.map((c: string[]) => c[0]);
    expect(revokedUrls.every((url: string) => url.startsWith('blob:'))).toBe(true);
  });
});
