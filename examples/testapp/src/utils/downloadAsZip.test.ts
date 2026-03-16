import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { collectLocalStorageData, downloadSessionAsZip } from './downloadAsZip';

describe('collectLocalStorageData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty object when localStorage is empty', () => {
    expect(collectLocalStorageData()).toEqual({});
  });

  it('returns all key-value pairs from localStorage', () => {
    localStorage.setItem('foo', 'bar');
    localStorage.setItem('baz', 'qux');
    expect(collectLocalStorageData()).toEqual({ foo: 'bar', baz: 'qux' });
  });
});

describe('downloadSessionAsZip', () => {
  beforeEach(() => {
    localStorage.clear();

    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn().mockReturnValue('blob:mock-url'),
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an anchor element, triggers click, and revokes the object URL', async () => {
    const anchor = document.createElement('a');
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {});
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValueOnce(anchor as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    const config = { version: 'HEAD', option: 'all', scwUrl: 'https://example.com' };
    await downloadSessionAsZip(config);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sets the correct download filename', async () => {
    const anchor = document.createElement('a');
    vi.spyOn(anchor, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    const config = { version: 'HEAD', option: 'all', scwUrl: 'https://example.com' };
    await downloadSessionAsZip(config);

    expect(anchor.download).toBe('session.zip');
  });
});

