---
head:
  - - script
    - {}
    - |
      const lang = navigator.language || navigator.userLanguage;
      if (lang.toLowerCase().startsWith('zh')) {
        window.location.replace('/zh/');
      } else {
        window.location.replace('/en/');
      }
---
<noscript>
  <meta http-equiv="refresh" content="0;url=/en/" />
</noscript>
<div style="text-align: center; padding-top: 50px; font-family: sans-serif;">
  <h1>Redirecting...</h1>
  <p>
    <a href="/en/">Click here to go to the English site</a>
  </p>
  <p>
    <a href="/zh/">点击这里前往中文站点</a>
  </p>
</div>