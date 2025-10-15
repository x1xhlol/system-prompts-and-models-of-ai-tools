---
layout: page
sidebar: false
outline: false
docFooter:
  prev: false
  next: false
---

<div class="timeline-section">
  <h2>🛠️ Implementation Roadmap</h2>
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>1. Fork Official Repository</h3>
        <p>Fork the <a href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools" target="_blank">official repository</a> to your personal account, establishing the foundation for secondary development.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>2. Convert Document Format</h3>
        <p>Use custom scripts in the <code>scripts</code> directory to batch convert source files into a unified Markdown format, generating both 'zh' and 'en' document folders.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>3. Translation and Localization</h3>
        <p>Translate and proofread the generated Markdown documents, completing the localization to prepare for a bilingual website.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>4. Build Documentation Website</h3>
        <p>Build a bilingual static website based on VitePress, with deep customization including theme, navigation, and homepage layout.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>5. Configure Automatic Synchronization</h3>
        <p>Configure GitHub Actions to automatically detect updates in the upstream repository and generate intuitive update reports for review and manual synchronization.</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-content">
        <h3>6. Deploy to Vercel</h3>
        <p>After the project builds successfully locally, deploy it online via Vercel. There's a certain free tier, allowing for almost 0 cost successful operation.</p>
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
     This project is primarily based on the open-source project "system prompts and models of ai tools". Building upon the original project, the documentation has been further summarized and localized. Therefore, my summary focuses on the Chinese version, and the English part might not be entirely accurate. However, for native prompts, it is best to refer back to the original English text in the repository. The project has been completely refactored into a modern static documentation website using the VitePress tech stack, aiming to provide a better browsing and reading experience. Custom scripts in the `scripts` directory are used to batch convert source files into a unified Markdown format, generating both 'zh' and 'en' document folders. The generated Markdown documents are translated and proofread, completing the localization to prepare for a bilingual website. A bilingual static website is built based on VitePress, with deep customization including theme, navigation, and homepage layout. Finally, it is deployed on Vercel to save deployment costs. However, since most translations are done by AI, some translations might contain errors. If in doubt, it is recommended to directly check the content of the original repository.
  </p>
</div>