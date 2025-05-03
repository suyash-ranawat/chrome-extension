const API_BASE_URL = 'https://api.search.com'; // Replace with your actual base URL

const key = 'Iyo-KzAgODkoPCQmNSEp';
const auth = 'Ig,,';
const uid = 'VGVxdm9jZjVKdVpkT2g3Z25ONVBkZz09';
const sub = '';
const reset = '111'; // 🆕 Added reset = 111

export async function sendChatMessage(prompt: string, currentChatId?: string, isTerms?: boolean): Promise<string> {
  const url = new URL(`${API_BASE_URL}/search`);

  url.searchParams.set('prompt', prompt);
  url.searchParams.set('key', key);
  url.searchParams.set('auth', auth);
  url.searchParams.set('sub', sub);
  url.searchParams.set('reset', reset); // 🆕 Add reset=111 always

  if (uid) url.searchParams.set('uid', uid);
  if (currentChatId) url.searchParams.set('currentChatId', currentChatId);
  if (isTerms) url.searchParams.set('isTerms', '1');

  const res = await fetch(url.toString());

  if (!res.ok) throw new Error('API request failed');

  const data = await res.json();
  return data;
}

export async function inBrowerContent(prompt: string): Promise<string> {
    const url = new URL(`${API_BASE_URL}/search`);

    url.searchParams.set('prompt', prompt);
    url.searchParams.set('key', key);
    url.searchParams.set('auth', auth);
    url.searchParams.set('sub', sub);
    url.searchParams.set('reset', reset); // 🆕 Add reset=111 always
  
    if (uid) url.searchParams.set('uid', uid);
    url.searchParams.set('currentChatId', '');
    url.searchParams.set('isTerms', '1');
  
    const res = await fetch(url.toString());
  
    if (!res.ok) throw new Error('API request failed');
  
    const data = await res.json();
    return data;
}
