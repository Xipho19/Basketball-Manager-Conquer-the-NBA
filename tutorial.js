/* ============================================================
   COMIC RED / WHITE — L0 coach marks
   Non-invasive onboarding overlay. No gameplay or save changes.
   Progress lives in localStorage, not in the career save.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "bm:tutorial:v1";
  var DB_NAME = "bm-tutorial";
  var DB_STORE = "state";
  var DB_KEY = "progress";
  var STEPS = Array.isArray(window.BM_TUTORIAL_STEPS) ? window.BM_TUTORIAL_STEPS : [];
  var CORE = STEPS.filter(function (step) {
    return !step.optional;
  });

  var state = defaultState();
  var dbPromise = null;
  var root = null;
  var backdrop = null;
  var spot = null;
  var card = null;
  var toast = null;
  var currentStep = null;
  var currentIndex = -1;
  var dismissedStep = null;
  var modalMode = false;
  var scrolledStep = null;
  var tickTimer = null;
  var layoutTimer = null;
  var toastTimer = null;
  var observer = null;
  var booted = false;

  /* ---------- state ---------- */

  function defaultState() {
    return { version: 1, status: "unseen", completed: [], seen: [], skipped: false };
  }

  function normalizeState(value) {
    if (!value || value.version !== 1) return defaultState();
    if (!Array.isArray(value.completed)) value.completed = [];
    if (!Array.isArray(value.seen)) value.seen = [];
    if (typeof value.status !== "string") value.status = "unseen";
    return value;
  }

  function loadLocalState() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      return normalizeState(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      try {
        var request = window.indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = function () {
          var db = request.result;
          if (!db.objectStoreNames.contains(DB_STORE)) {
            db.createObjectStore(DB_STORE);
          }
        };
        request.onsuccess = function () {
          resolve(request.result);
        };
        request.onerror = function () {
          reject(request.error);
        };
      } catch (e) {
        reject(e);
      }
    });
    return dbPromise;
  }

  function idbGet() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, "readonly");
        var request = tx.objectStore(DB_STORE).get(DB_KEY);
        request.onsuccess = function () {
          resolve(request.result || null);
        };
        request.onerror = function () {
          reject(request.error);
        };
      });
    });
  }

  function idbSet(value) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).put(value, DB_KEY);
        tx.oncomplete = function () {
          resolve();
        };
        tx.onerror = function () {
          reject(tx.error);
        };
      });
    });
  }

  function loadPersistedState() {
    return idbGet()
      .then(function (saved) {
        if (saved) return normalizeState(saved);
        var local = loadLocalState();
        if (local) {
          idbSet(local).catch(function () {});
          return local;
        }
        return defaultState();
      })
      .catch(function () {
        return loadLocalState() || defaultState();
      });
  }

  function saveState() {
    var snapshot = JSON.parse(JSON.stringify(state));
    // localStorage is a fast mirror; the game clears localStorage when a new
    // career starts, so IndexedDB is the durable copy.
    try {
      window.localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch (e) {}
    idbSet(snapshot).catch(function () {});
  }

  function isCompleted(id) {
    return state.completed.indexOf(id) >= 0;
  }

  function markCompleted(id) {
    if (!isCompleted(id)) {
      state.completed.push(id);
      saveState();
    }
  }

  function resetProgress() {
    state = { version: 1, status: "active", completed: [], seen: [], skipped: false };
    saveState();
    currentIndex = -1;
    currentStep = null;
    dismissedStep = null;
    scrolledStep = null;
  }

  function allCoreDone() {
    return CORE.every(function (step) {
      return isCompleted(step.id);
    });
  }

  /* ---------- dom ---------- */

  function ensureDom() {
    if (!document.body) return;
    if (!root || !root.isConnected) {
      root = document.createElement("div");
      root.className = "bm-tut-root";
      root.setAttribute("aria-live", "polite");

      backdrop = document.createElement("div");
      backdrop.className = "bm-tut-backdrop";

      spot = document.createElement("div");
      spot.className = "bm-tut-spot";

      card = document.createElement("section");
      card.className = "bm-tut-card";
      card.setAttribute("role", "dialog");

      root.appendChild(backdrop);
      root.appendChild(spot);
      root.appendChild(card);
      document.body.appendChild(root);
    }
    if (!toast || !toast.isConnected) {
      toast = document.createElement("div");
      toast.className = "bm-tut-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    var style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (parseFloat(style.opacity) === 0) return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function firstVisible(selectors) {
    if (!selectors) return null;
    var list = Array.isArray(selectors) ? selectors : [selectors];
    for (var i = 0; i < list.length; i++) {
      var nodes;
      try {
        nodes = document.querySelectorAll(list[i]);
      } catch (e) {
        continue;
      }
      for (var j = 0; j < nodes.length; j++) {
        if (isVisible(nodes[j])) return nodes[j];
      }
    }
    return null;
  }

  function hasVisibleScene(step) {
    return !!firstVisible(step.scene);
  }

  function isBlocked(step) {
    return !!(step.blockedBy && firstVisible(step.blockedBy));
  }

  function hasBlockingOverlay() {
    return !!firstVisible([".leaderboard-overlay"]);
  }

  function hasVisibleOptional() {
    for (var i = 0; i < STEPS.length; i++) {
      var step = STEPS[i];
      if (!step.optional || isCompleted(step.id) || isBlocked(step)) continue;
      if (hasVisibleScene(step)) return true;
    }
    return false;
  }

  function hasSettingsDialog() {
    return !!firstVisible([".settings-dialog"]);
  }

  /* ---------- content helpers ---------- */

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pad(number) {
    return (number < 10 ? "0" : "") + number;
  }

  function progressLabel(step) {
    if (step.optional) return "小贴士";
    var seen = state.seen || [];
    var index = seen.indexOf(step.id);
    return "第 " + pad(index >= 0 ? index + 1 : seen.length + 1) + " 步";
  }

  function closeSettingsDialog() {
    var close = document.querySelector('.settings-dialog button[aria-label="关闭设置"]');
    if (close) {
      close.click();
      return;
    }
    var dialog = document.querySelector(".settings-dialog");
    if (dialog) {
      var buttons = dialog.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        var label = (buttons[i].getAttribute("aria-label") || "") + (buttons[i].textContent || "");
        if (label.indexOf("关闭") >= 0) {
          buttons[i].click();
          return;
        }
      }
    }
  }

  /* ---------- rendering ---------- */

  function showToast(message) {
    ensureDom();
    toast.textContent = message;
    toast.classList.add("is-on");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-on");
    }, 3400);
  }

  function baseHead(progress) {
    return (
      '<div class="bm-tut-head">' +
      '<span class="bm-tut-stamp">COACH NOTES · 教练笔记</span>' +
      '<span class="bm-tut-progress">' +
      esc(progress) +
      "</span>" +
      '<button type="button" class="bm-tut-close" aria-label="关闭教练笔记">×</button>' +
      "</div>"
    );
  }

  function bindClose(handler) {
    var close = card.querySelector(".bm-tut-close");
    if (close) close.addEventListener("click", handler);
  }

  function showWelcome() {
    ensureDom();
    modalMode = true;
    root.className = "bm-tut-root is-on is-modal";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-labelledby", "bm-tut-title");
    card.setAttribute("aria-describedby", "bm-tut-body");
    card.innerHTML =
      baseHead("L0 · 第一年") +
      '<div class="bm-tut-title" id="bm-tut-title" role="heading" aria-level="2">第一年，带你走一遍</div>' +
      '<div class="bm-tut-body" id="bm-tut-body">从选队、建队、选秀、自由市场，到开季前的裁员和第一场比赛，关键操作我都会提醒你。</div>' +
      '<ul class="bm-tut-welcome-list">' +
      "<li>我只在关键界面出现，一次讲一件事。</li>" +
      "<li>可以随时跳过，之后在「设置 → 教练笔记」重看。</li>" +
      "<li>已有存档也可以开始，我会自动跳过建队部分。</li>" +
      "</ul>" +
      '<div class="bm-tut-actions">' +
      '<button type="button" class="bm-tut-secondary">先不用</button>' +
      '<button type="button" class="bm-tut-primary">开始引导</button>' +
      "</div>" +
      '<p class="bm-tut-note">不会修改任何数值、玩法或存档。进度只保存在本机。</p>';

    bindClose(skipAll);
    card.querySelector(".bm-tut-secondary").addEventListener("click", skipAll);
    card.querySelector(".bm-tut-primary").addEventListener("click", startTutorial);
    focusPrimary();
  }

  function startTutorial() {
    ensureDom();
    modalMode = false;
    if (state.status !== "active") {
      state.status = "active";
      state.skipped = false;
      saveState();
    }
    root.className = "bm-tut-root";
    card.dataset.stepId = "";
    currentStep = null;
    currentIndex = -1;
    dismissedStep = null;
    scrolledStep = null;
    tick();
  }

  function showStep(step, index, isUpdate) {
    ensureDom();
    modalMode = false;
    currentStep = step;
    currentIndex = index;

    if (isUpdate && card.dataset.stepId === step.id && root.classList.contains("is-on")) {
      positionCoach(step);
      return;
    }

    if (!step.optional && (state.seen || []).indexOf(step.id) < 0) {
      state.seen.push(step.id);
      saveState();
    }

    root.className = "bm-tut-root is-on is-coach";
    card.dataset.stepId = step.id;
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "false");
    card.setAttribute("aria-labelledby", "bm-tut-title");
    card.setAttribute("aria-describedby", "bm-tut-body");
    card.innerHTML =
      baseHead(progressLabel(step)) +
      '<div class="bm-tut-title" id="bm-tut-title" role="heading" aria-level="2">' +
      esc(step.title) +
      "</div>" +
      '<div class="bm-tut-body" id="bm-tut-body">' +
      esc(step.body) +
      "</div>" +
      '<div class="bm-tut-actions">' +
      '<button type="button" class="bm-tut-secondary">跳过</button>' +
      '<button type="button" class="bm-tut-primary">' +
      esc(step.primary || "下一步") +
      "</button>" +
      "</div>";

    bindClose(dismissStep);
    card.querySelector(".bm-tut-secondary").addEventListener("click", skipAll);
    card.querySelector(".bm-tut-primary").addEventListener("click", advanceStep);

    var anchor = firstVisible(step.anchor);
    if (!anchor) {
      positionCenter();
      return;
    }
    scrollAnchorIntoView(step, anchor);
    positionCoach(step);
    startLayoutLoop();
  }

  function positionCenter() {
    root.classList.add("is-center");
    root.classList.remove("is-coach");
    if (spot) spot.style.display = "none";
    card.style.left = "";
    card.style.top = "";
  }

  function positionCoach(step) {
    var anchor = firstVisible(step.anchor);
    if (!anchor) {
      if (card && root.classList.contains("is-on")) positionCenter();
      return;
    }
    root.classList.remove("is-center");
    root.classList.add("is-coach");

    var rect = anchor.getBoundingClientRect();
    placeSpot(rect);
    placeCard(rect, step.placement);
  }

  function placeSpot(rect) {
    if (!spot) return;
    var pad = 5;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var x = Math.max(2, rect.left - pad);
    var y = Math.max(2, rect.top - pad);
    var w = Math.min(vw - x - 2, rect.width + pad * 2);
    var h = Math.min(vh - y - 2, rect.height + pad * 2);
    var maxH = Math.round(vh * 0.58);
    if (h > maxH) h = maxH;
    if (w < 12 || h < 12) {
      spot.style.display = "none";
      return;
    }
    spot.style.display = "block";
    spot.style.left = x + "px";
    spot.style.top = y + "px";
    spot.style.width = w + "px";
    spot.style.height = h + "px";
  }

  function placeCard(rect, placement) {
    if (!card) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var margin = 12;
    var gap = 10;
    var cardW = card.offsetWidth || 360;
    var cardH = card.offsetHeight || 220;

    var below = vh - rect.bottom - margin - gap;
    var above = rect.top - margin - gap;
    var preferBelow = placement !== "top";
    var top;

    if (preferBelow && below >= cardH) {
      top = rect.bottom + gap;
    } else if (above >= cardH) {
      top = rect.top - cardH - gap;
    } else if (below >= above) {
      top = Math.min(vh - cardH - margin, rect.bottom + gap);
    } else {
      top = Math.max(margin, rect.top - cardH - gap);
    }
    if (top < margin) top = margin;
    if (top + cardH > vh - margin) top = Math.max(margin, vh - cardH - margin);

    var left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(margin, Math.min(left, vw - cardW - margin));

    card.style.left = Math.round(left) + "px";
    card.style.top = Math.round(top) + "px";
    card.style.transform = "none";
  }

  function scrollAnchorIntoView(step, anchor) {
    if (scrolledStep === step.id) return;
    scrolledStep = step.id;
    var rect = anchor.getBoundingClientRect();
    var vh = window.innerHeight;
    if (rect.top < 8 || rect.bottom > vh - 8) {
      try {
        anchor.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      } catch (e) {
        anchor.scrollIntoView();
      }
      setTimeout(function () {
        if (currentStep === step) positionCoach(step);
      }, 320);
    }
  }

  function startLayoutLoop() {
    if (layoutTimer) return;
    layoutTimer = setInterval(function () {
      if (currentStep && root && root.classList.contains("is-coach")) {
        positionCoach(currentStep);
      }
    }, 300);
  }

  function stopLayoutLoop() {
    if (layoutTimer) {
      clearInterval(layoutTimer);
      layoutTimer = null;
    }
  }

  function hideCard() {
    if (root) root.className = "bm-tut-root";
    if (spot) spot.style.display = "none";
    stopLayoutLoop();
  }

  /* ---------- actions ---------- */

  function advanceStep() {
    if (!currentStep) return;
    var step = currentStep;
    var index = STEPS.indexOf(step);
    var lastCore = !step.optional && CORE.length > 0 && CORE[CORE.length - 1].id === step.id;

    markCompleted(step.id);
    currentIndex = index + 1;
    currentStep = null;
    dismissedStep = null;
    scrolledStep = null;
    hideCard();

    if (lastCore || allCoreDone()) {
      finish();
      return;
    }
    setTimeout(tick, 120);
  }

  function dismissStep() {
    if (modalMode) {
      closeModal();
      return;
    }
    if (currentStep) dismissedStep = currentStep.id;
    hideCard();
  }

  function skipAll() {
    state.status = "skipped";
    state.skipped = true;
    saveState();
    modalMode = false;
    currentStep = null;
    hideCard();
    showToast("已跳过新手引导 · 设置 → 教练笔记可重看");
  }

  function finish() {
    state.status = "done";
    state.skipped = false;
    saveState();
    modalMode = false;
    currentStep = null;
    currentIndex = STEPS.length;
    hideCard();
    showToast("教练笔记已收好 · 设置 → 教练笔记可重看");
  }

  /* ---------- settings entry ---------- */

  function injectSettingsEntry() {
    ensureDom();
    var options = document.querySelector(".settings-dialog .settings-options");
    if (!options) return;
    if (options.querySelector(".tutorial-settings-entry")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "tutorial-settings-entry";
    button.innerHTML =
      '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>' +
      '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path>' +
      '<path d="M8 7h8M8 11h6"></path>' +
      "</svg>" +
      "<span><b>教练笔记</b><small>新手引导与操作提示</small></span>" +
      "<em>›</em>";
    button.addEventListener("click", function () {
      closeSettingsDialog();
      setTimeout(openMenu, 60);
    });
    options.appendChild(button);
  }

  function openMenu() {
    ensureDom();
    modalMode = true;
    root.className = "bm-tut-root is-on is-modal";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-labelledby", "bm-tut-title");
    card.setAttribute("aria-describedby", "bm-tut-body");

    var active = state.status === "active";
    card.innerHTML =
      baseHead(active ? "进行中" : "随时重看") +
      '<div class="bm-tut-title" id="bm-tut-title" role="heading" aria-level="2">教练笔记</div>' +
      '<div class="bm-tut-body" id="bm-tut-body">' +
      (active
        ? "引导正在进行中。你可以继续当前步骤，或从头重看核心内容。"
        : "重看核心引导，了解从建队到第一场比赛的关键操作。") +
      "</div>" +
      '<div class="bm-tut-actions">' +
      (active
        ? '<button type="button" class="bm-tut-secondary">从头重看</button>' +
          '<button type="button" class="bm-tut-primary">继续引导</button>'
        : '<button type="button" class="bm-tut-secondary">关闭</button>' +
          '<button type="button" class="bm-tut-primary">重看引导</button>') +
      "</div>";

    bindClose(closeModal);
    if (active) {
      card.querySelector(".bm-tut-secondary").addEventListener("click", resetAndStart);
      card.querySelector(".bm-tut-primary").addEventListener("click", closeModal);
    } else {
      card.querySelector(".bm-tut-secondary").addEventListener("click", closeModal);
      card.querySelector(".bm-tut-primary").addEventListener("click", resetAndStart);
    }
    focusPrimary();
  }

  function closeModal() {
    modalMode = false;
    if (state.status === "active") {
      root.className = "bm-tut-root";
      tick();
    } else {
      hideCard();
    }
  }

  function resetAndStart() {
    resetProgress();
    modalMode = false;
    startTutorial();
  }

  function focusPrimary() {
    setTimeout(function () {
      var primary = card && card.querySelector(".bm-tut-primary");
      if (primary) {
        try {
          primary.focus({ preventScroll: true });
        } catch (e) {}
      }
    }, 40);
  }

  /* ---------- engine ---------- */

  function tick() {
    if (!state || state.status !== "active" || modalMode) return;
    ensureDom();
    if (hasSettingsDialog() || hasBlockingOverlay()) {
      hideCard();
      return;
    }
    if (allCoreDone() && !hasVisibleOptional()) {
      finish();
      return;
    }

    var picked = null;
    for (var i = 0; i < STEPS.length; i++) {
      if (i < currentIndex) continue;
      var step = STEPS[i];
      if (isCompleted(step.id)) continue;
      if (dismissedStep === step.id && currentStep && currentStep.id === step.id) continue;
      if (isBlocked(step)) continue;
      if (hasVisibleScene(step)) {
        picked = { step: step, index: i };
        break;
      }
    }

    if (!picked) {
      hideCard();
      return;
    }

    if (picked.index !== currentIndex) {
      for (var j = Math.max(0, currentIndex); j < picked.index; j++) {
        markCompleted(STEPS[j].id);
      }
      currentIndex = picked.index;
      currentStep = picked.step;
      dismissedStep = null;
      scrolledStep = null;
      showStep(picked.step, picked.index, false);
      return;
    }

    currentStep = picked.step;
    showStep(picked.step, picked.index, true);
  }

  function scheduleTick() {
    if (tickTimer) return;
    tickTimer = setTimeout(function () {
      tickTimer = null;
      tick();
    }, 180);
  }

  function scheduleLayout() {
    if (!root || !root.classList.contains("is-coach") || !currentStep) return;
    requestAnimationFrame(function () {
      if (currentStep) positionCoach(currentStep);
    });
  }

  function onMutations() {
    injectSettingsEntry();
    if (state.status === "active") scheduleTick();
  }

  function setupObservers() {
    if (window.MutationObserver && document.body) {
      observer = new MutationObserver(onMutations);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
    }
    document.addEventListener(
      "click",
      function () {
        injectSettingsEntry();
        if (state.status === "active") scheduleTick();
      },
      true
    );
    window.addEventListener("resize", scheduleLayout);
    window.addEventListener("scroll", scheduleLayout, true);
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (modalMode) {
        closeModal();
      } else if (root && root.classList.contains("is-on")) {
        dismissStep();
      }
    });
  }

  function waitForGame(callback, attempts) {
    attempts = attempts || 0;
    if (firstVisible([".launcher-shell", ".app-shell"])) {
      callback();
      return;
    }
    if (attempts > 150) return;
    setTimeout(function () {
      waitForGame(callback, attempts + 1);
    }, 200);
  }

  function boot() {
    if (booted) return;
    booted = true;

    loadPersistedState().then(function (saved) {
      state = saved;
      ensureDom();
      injectSettingsEntry();
      setupObservers();

      if (state.status === "unseen") {
        waitForGame(showWelcome);
      } else if (state.status === "active") {
        waitForGame(function () {
          tick();
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
