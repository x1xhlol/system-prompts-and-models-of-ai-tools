// entry for SSR
import { renderToString } from 'vue/server-renderer';
import { createApp } from './index';
export async function render(path) {
    const { app, router } = await createApp();
    await router.go(path);
    const ctx = { content: '', vpSocialIcons: new Set() };
    ctx.content = await renderToString(app, ctx);
    return ctx;
}
