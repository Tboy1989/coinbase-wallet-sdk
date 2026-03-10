import JSZip from 'jszip';

type SessionConfig = {
  version: string | undefined;
  option: string | undefined;
  scwUrl: string | undefined;
};

/**
 * Collects all localStorage entries into a plain object.
 */
export function collectLocalStorageData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null) {
      data[key] = localStorage.getItem(key) ?? '';
    }
  }
  return data;
}

/**
 * Builds a zip archive containing a config snapshot and the current
 * localStorage state, then triggers a browser download.
 */
export async function downloadSessionAsZip(config: SessionConfig): Promise<void> {
  const zip = new JSZip();

  zip.file('config.json', JSON.stringify(config, null, 2));
  zip.file('localStorage.json', JSON.stringify(collectLocalStorageData(), null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'session.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
