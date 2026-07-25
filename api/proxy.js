export default async function handler(req, res) {
  const targetUrl = "https://8sikkim.com";

  try {
    // Fetch the target website
    const response = await fetch(targetUrl);
    let html = await response.text();

    // Inject auto-click script just before </body>
    const injectScript = `
<script>
(function() {
  function clickRandomButtons() {
    const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], .btn, [role="button"]');
    
    buttons.forEach((btn, i) => {
      const delay = Math.random() * 5000; // 0-5 seconds random
      setTimeout(() => {
        try {
          btn.click();
          console.log('🖱️ Auto-clicked button #' + (i + 1));
        } catch(e) {}
      }, delay);
    });
  }

  // Start when page loads
  if (document.readyState === 'complete') {
    clickRandomButtons();
  } else {
    window.addEventListener('load', clickRandomButtons);
  }

  // Also auto-click new buttons that appear later (MutationObserver)
  const observer = new MutationObserver(() => clickRandomButtons());
  observer.observe(document.body, { childList: true, subtree: true });
})();
</script>
`;

    html = html.replace("</body>", injectScript + "</body>");

    // Also fix relative URLs to absolute (basic version)
    const baseUrl = new URL(targetUrl);
    html = html.replace(
      /(src|href)="\/(?!\/)/g,
      `$1="${baseUrl.origin}/`
    );

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: "Proxy failed" });
  }
}

