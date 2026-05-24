import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { buildChatCompletionsUrl } from '../src/server/llm/openai-url.ts';

test('buildChatCompletionsUrl preserves /v1 when base URL has no trailing slash', () => {
  assert.equal(buildChatCompletionsUrl('https://api.openai.com/v1'), 'https://api.openai.com/v1/chat/completions');
});

test('buildChatCompletionsUrl preserves /v1 when base URL has a trailing slash', () => {
  assert.equal(buildChatCompletionsUrl('https://api.openai.com/v1/'), 'https://api.openai.com/v1/chat/completions');
});

test('buildChatCompletionsUrl preserves custom OpenAI-compatible base paths', () => {
  assert.equal(
    buildChatCompletionsUrl('https://example.com/openai/v1'),
    'https://example.com/openai/v1/chat/completions',
  );
});
