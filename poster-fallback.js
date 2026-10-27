/* Local poster fallback for the offline reskin.
 *
 * The original share flow uploads the generated poster to Hupu OSS and opens
 * the Hupu post editor. Offline that upload fails with "Network Error", even
 * though the poster canvas was generated successfully.
 *
 * This patch intercepts only poster uploads (`basketball-manager-*.png`) and
 * shows the poster in a local overlay with a download link.
 */
(function () {
  if (window.__COMIC_POSTER_FALLBACK__) return;
  window.__COMIC_POSTER_FALLBACK__ = true;

  var pending = null;

  function showPoster(item) {
    var old = document.getElementById("comic-poster-overlay");
    if (old) old.remove();

    var wrap = document.createElement("div");
    wrap.id = "comic-poster-overlay";
    wrap.style.cssText =
      "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.86);" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
      "padding:16px;gap:14px;";

    var img = document.createElement("img");
    img.src = item.url;
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
      'font-family:"ComicCN","Microsoft YaHei",sans-serif;';

    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "关闭";
    close.style.cssText =
      "background:#f7f1e3;color:#141414;border:3px solid #111;box-shadow:4px 4px 0 #141414;" +
      "padding:9px 18px;font-weight:900;border-radius:0;font-family:inherit;";
    close.onclick = function () {
      wrap.remove();
    };

    bar.appendChild(hint);
    bar.appendChild(close);
    wrap.appendChild(img);
    wrap.appendChild(bar);
    document.body.appendChild(wrap);
  }

  function install() {
    var cb = window.ColorboxAI;
    if (!cb || !cb.oss || !cb.request || !cb.request.bbs) return false;
    if (cb.__comicPosterPatched) return true;
    cb.__comicPosterPatched = true;

    var oss = cb.oss;
    oss.uploadFile = function (opts) {
      try {
        var name = (opts && opts.filename) || "";
        if (opts && opts.file && /^basketball-manager-/.test(name)) {
          var url = URL.createObjectURL(opts.file);
          pending = { url: url, name: name };
          return Promise.resolve({
            downloadUrl: "https://local.invalid/" + encodeURIComponent(name)
          });
        }
      } catch (e) {
        /* fall through */
      }
      return Promise.reject(new Error("图片上传暂不可用"));
    };

    var bbs = cb.request.bbs;
    var origEditor =
      typeof bbs.openPostEditor === "function" ? bbs.openPostEditor.bind(bbs) : null;
    bbs.openPostEditor = function (payload) {
      if (pending) {
        showPoster(pending);
        pending = null;
        return Promise.resolve({ code: 200 });
      }
      return origEditor
        ? origEditor(payload)
        : Promise.reject(new Error("发帖编辑器暂时无法打开"));
    };

    /* Roster share checks login + content audit before drawing the poster.
     * For a local, upload-free poster we fake those two checks only during
     * a click on the roster share button. */
    var auth = cb.auth;
    if (auth && typeof auth.getUserInfo === "function" && !auth.__comicShareBypass) {
      var origUser = auth.getUserInfo;
      auth.getUserInfo = function () {
        if (window.__comicLocalShare) {
          return Promise.resolve({ code: 200, data: { islogin: 1, puid: "local" } });
        }
        return origUser.apply(auth, arguments);
      };
      auth.__comicShareBypass = true;
    }
    var security = cb.security;
    if (
      security &&
      typeof security.checkAudit === "function" &&
      !security.__comicShareBypass
    ) {
      var origAudit = security.checkAudit;
      security.checkAudit = function () {
        if (window.__comicLocalShare) {
          return Promise.resolve({ code: 200, data: true });
        }
        return origAudit.apply(security, arguments);
      };
      security.__comicShareBypass = true;
    }
    if (!window.__comicShareClickBound) {
      window.__comicShareClickBound = true;
      document.addEventListener(
        "click",
        function (event) {
          var el = event.target;
          while (el && el !== document) {
            if (el.classList && el.classList.contains("rotation-share-button")) {
              window.__comicLocalShare = true;
              setTimeout(function () {
                window.__comicLocalShare = false;
              }, 20000);
              break;
            }
            el = el.parentElement;
          }
        },
        true
      );
    }

    return true;
  }

  if (!install()) {
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (install() || tries > 120) clearInterval(timer);
    }, 500);
  }
})();
