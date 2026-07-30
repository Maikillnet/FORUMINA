import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SimpleMarkdown } from '../src/components/forum/SimpleMarkdown.jsx';

describe('SimpleMarkdown (XSS regression)', () => {
  beforeEach(() => {
    delete window.__xss_fired;
    document.title = 'FORUM.LIVE';
  });

  it('renders an injected <img onerror> tag as inert text, not a live element', () => {
    const payload = 'before <img src=x onerror="window.__xss_fired=true"> after';
    const { container } = render(<SimpleMarkdown emojis={[]}>{payload}</SimpleMarkdown>);

    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror="window.__xss_fired=true">');
    expect(window.__xss_fired).toBeUndefined();
  });

  it('escapes a raw <script> tag as text', () => {
    const payload = '<script>window.__xss_fired = true;</script>';
    const { container } = render(<SimpleMarkdown emojis={[]}>{payload}</SimpleMarkdown>);

    expect(container.querySelector('script')).toBeNull();
    expect(window.__xss_fired).toBeUndefined();
  });

  it('still renders legitimate **bold** and `code` formatting', () => {
    const { container } = render(<SimpleMarkdown emojis={[]}>{'**bold** and `code`'}</SimpleMarkdown>);

    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('code')?.textContent).toBe('code');
  });

  it('still renders admin-configured image emojis as real <img> tags', () => {
    const emojis = [{ code: ':fire:', type: 'image', value: 'data:image/png;base64,AAA' }];
    const { container } = render(<SimpleMarkdown emojis={emojis}>{'nice :fire:'}</SimpleMarkdown>);

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('data:image/png;base64,AAA');
  });

  it('preserves fenced code blocks as plain text (no HTML execution inside)', () => {
    const payload = '```\n<img src=x onerror="window.__xss_fired=true">\n```';
    const { container } = render(<SimpleMarkdown emojis={[]}>{payload}</SimpleMarkdown>);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('pre code')?.textContent).toContain('<img src=x onerror=');
  });
});
