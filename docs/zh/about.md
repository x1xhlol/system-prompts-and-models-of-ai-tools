---
layout: page
sidebar: false
outline: false
docFooter:
  prev: false
  next: false
---

<div class="timeline-section">
  <h2>🛠️ 实现路线</h2>
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>1. Fork 官方仓库</h3>
        <p>复刻 <a href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools" target="_blank">官方仓库</a> 到个人账户，建立二次开发的基础。</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>2. 转换文档格式</h3>
        <p>使用 <code>scripts</code> 目录下的自定义脚本，将源文件批量转换为统一的 Markdown 格式，并生成zh和en两个文档文件夹。</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>3. 翻译与汉化</h3>
        <p>对生成的 Markdown 文档进行翻译和校对，完成汉化，为后续的双语网站做准备。</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>4. 构建文档网站</h3>
        <p>基于 VitePress 搭建双语静态网站，并进行深度定制，包括主题、导航、主页布局。</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>5. 配置自动同步</h3>
        <p>配置 GitHub Action 自动检测上游仓库的更新，并生成直观的更新报告以供审阅和手动同步。</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>6. 部署到 Vercel</h3>
        <p>项目本地构建没问题后，通过 Vercel 来部署上线，有一定的免费额度，可以几乎实现 0 成本成功运营。</p>
      </div>
    </div>
  </div>
</div>

<style>
  .timeline-section {
    max-width: 800px;
    margin: 80px auto;
    padding: 20px;
  }
  .timeline-section h2 {
    text-align: center;
    font-size: 2.2em;
    margin-bottom: 60px;
    font-weight: 600;
    line-height: 1.4;
    padding: 0.2em 0;
    background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .timeline {
    position: relative;
    padding: 20px 0;
  }
  .timeline::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background-color: var(--vp-c-divider);
  }
  .timeline-item {
    padding: 20px 40px;
    position: relative;
    width: 50%;
  }
  .timeline-item:nth-child(1) { animation-delay: 0.2s; }
  .timeline-item:nth-child(2) { animation-delay: 0.4s; }
  .timeline-item:nth-child(3) { animation-delay: 0.6s; }
  .timeline-item:nth-child(4) { animation-delay: 0.8s; }
  .timeline-item:nth-child(5) { animation-delay: 1.0s; }
  .timeline-item:nth-child(6) { animation-delay: 1.2s; } /* New delay for 6th item */
  .timeline-item:nth-child(odd) {
    left: 0;
    padding-right: 30px;
    text-align: right;
  }
  .timeline-item:nth-child(even) {
    left: 50%;
    padding-left: 30px;
  }
  .timeline-item::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: var(--vp-c-bg);
    border: 3px solid var(--vp-c-brand-1);
    top: 45px;
    z-index: 1;
  }
  .timeline-item:nth-child(odd)::after {
    right: -8px;
  }
  .timeline-item:nth-child(even)::after {
    left: -8px;
  }
  .timeline-content {
    padding: 20px;
    background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
  }
  .timeline-content h3 {
    margin-top: 0;
    font-size: 1.25em;
    color: var(--vp-c-brand-1);
    font-weight: 600;
  }
  .timeline-content p {
    margin-bottom: 0;
    font-size: 0.9em;
    line-height: 1.6;
  }
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      /* transform: translateY(0); -- Removed to avoid conflict */
    }
  }
  @media (max-width: 768px) {
    .timeline::before {
      left: 10px;
    }
    .timeline-item, .timeline-item:nth-child(even) {
      width: 100%;
      left: 0;
      padding-left: 40px;
      padding-right: 10px;
      text-align: left;
    }
    .timeline-item:nth-child(odd) {
      padding-right: 10px;
      text-align: left;
    }
    .timeline-item::after, .timeline-item:nth-child(even)::after {
      left: 2px;
    }
  }
</style>

<div style="max-width: 800px; margin: 60px auto; text-align: left;">
  <p style="font-size: 1.1em; line-height: 1.7; color: var(--vp-c-text-2); text-indent: 2em;">
     这个项目主要是基于system prompts and models of ai tools这个开源项目，在原项目的基础上，进一步对文档进行总结和汉化，所以我是以中文效果为主进行总结的，英文部分反倒可能不太精准，但原生的提示词，最好还是要回到仓库项目内查看英文原文。然后通过 VitePress 技术栈将其完全重构为一个现代化的静态文档网站，旨在提供更佳的浏览和阅读体验。使用 \`scripts\` 目录下的自定义脚本，将源文件批量转换为统一的 Markdown 格式，并生成zh和en两个文档文件夹。对生成的 Markdown 文档进行翻译和校对，完成汉化，为后续的双语网站做准备。基于 VitePress 搭建双语静态网站，并进行深度定制，包括主题、导航、主页布局等。最后部署在vercel上，节约下部署的成本。但因为大部分翻译转化都是基于ai完成的，所以部分翻译可能存在错误，如果有疑问还是建议直接查看原仓库的内容。
  </p>
</div>

