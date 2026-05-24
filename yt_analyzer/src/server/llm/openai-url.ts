export function buildChatCompletionsUrl(baseUrl: string) {
  return new URL('chat/completions', `${baseUrl.replace(/\/+$/, '')}/`).toString();
}
