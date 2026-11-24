/* Local poster preview for the offline/Lamps build.
 *
 * The original share flow uploaded the poster to Hupu OSS and opened the Hupu
 * post editor. This build exposes a local-only entry point instead; the game
 * patch calls window.__COMIC_SHOW_POSTER__ with the generated Blob.
 */
(function () {
  if (window.__COMIC_POSTER_FALLBACK__) return;
  window.__COMIC_POSTER_FALLBACK__ = true;

  var activeUrl = null;

  function showPoster(url) {
    var old = document.getElementById("comic-poster-overlay");
    if (old) old.remove();

    var wrap = document.createElement("div");
    wrap.id = "comic-poster-overlay";
    wrap.style.cssText =
      "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.86);" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
      "padding:16px;gap:14px;";

    var img = document.createElement("img");
    img.src = url;
    img.alt = "分享海报";
    img.style.cssText =
      "max-width:92vw;max-height:74vh;border:4px solid #f7f1e3;" +
      "box-shadow:8px 8px 0 #e01b24;background:#08080a;";

    var bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:10px;align-items:center;";

    var hint = document.createElement("span");
    hint.textContent = "请截图分享";
    hint.style.cssText =
      "background:#e01b24;color:#fff;border:3px solid #111;box-shadow:4px 4px 0 #111;" +
      "padding:9px 18px;font-weight:900;border-radius:0;" +
      'font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC",system-ui,sans-serif;';

    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "关闭";
    close.style.cssText =
      "background:#f7f1e3;color:#141414;border:3px solid #111;box-shadow:4px 4px 0 #141414;" +
      "padding:9px 18px;font-weight:900;border-radius:0;font-family:inherit;";
    close.onclick = function () {
      wrap.remove();
      if (activeUrl) {
        try {
          URL.revokeObjectURL(activeUrl);
        } catch (e) {}
        activeUrl = null;
      }
    };

    bar.appendChild(hint);
    bar.appendChild(close);
    wrap.appendChild(img);
    wrap.appendChild(bar);
    document.body.appendChild(wrap);
  }

  window.__COMIC_SHOW_POSTER__ = function (blob) {
    if (!blob) return;
    try {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
        activeUrl = null;
      }
      activeUrl = URL.createObjectURL(blob);
      showPoster(activeUrl);
    } catch (e) {
      /* canvas/blob may be unavailable; the game shows its own error */
    }
  };

  window.__COMIC_SHOW_POSTER_URL__ = showPoster;
})();
