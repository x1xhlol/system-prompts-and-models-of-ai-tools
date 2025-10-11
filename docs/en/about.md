---
layout: page
sidebar: false
outline: false
docFooter:
  prev: false
  next: false
---

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
    opacity: 0;
    animation: fadeInUp 0.8s ease-out forwards;
  }
  .timeline-item:nth-child(1) { animation-delay: 0.2s; }
  .timeline-item:nth-child(2) { animation-delay: 0.4s; }
  .timeline-item:nth-child(3) { animation-delay: 0.6s; }
  .timeline-item:nth-child(4) { animation-delay: 0.8s; }
  .timeline-item:nth-child(5) { animation-delay: 1.0s; }
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
      transform: translateY(0);
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

<div class="timeline-section">
  <h2>🛠️ Implementation Route</h2>
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>1. Fork Official Repository</h3>
        <p>Forked the <a href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools" target="_blank">official repository</a> to my personal account to establish a basis for secondary development.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>2. Convert Document Format</h3>
        <p>Used a custom script in the <code>scripts</code> directory to batch convert source files into a unified Markdown format.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>3. Translation & Localization</h3>
        <p>Translated and proofread the generated Markdown documents to prepare for a bilingual website.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>4. Build Documentation Site</h3>
        <p>Built a bilingual static site based on VitePress, with deep customization for the theme, navigation, and homepage layout.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>5. Configure Auto-Sync</h3>
        <p>Configured a GitHub Action to automatically detect upstream updates and generate intuitive reports for review and manual synchronization.</p>
      </div>
    </div>
  </div>
</div>

<div style="max-width: 800px; margin: 60px auto; text-align: center;">
  <p style="font-size: 1.1em; line-height: 1.7; color: var(--vp-c-text-2);">
    This project is a secondary development version of <a href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools" target="_blank">system-prompts-and-models-of-ai-tools</a>. I have refactored it into a modern documentation site using the <strong>VitePress</strong> tech stack to provide a better browsing experience. The conversion of content, translation, and site construction were all done in collaboration with AI, aiming to explore the potential of AI in the field of software engineering. Since most of the translation and conversion was done by AI, some errors may exist. If you have any doubts, it is recommended to check the content of the original repository directly.
  </p>
</div>
