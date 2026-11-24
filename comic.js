(function () {
  var vars = {
    "--accent-primary": "#e01b24",
    "--accent-primary-rgb": "224, 27, 36",
    "--accent-hover": "#ff3b30",
    "--bg-page": "#08080a",
    "--bg-card": "#141416f2",
    "--text-main": "#f7f1e3",
    "--text-sub": "#bdb5a7",
    "--border-color": "rgba(247,241,227,.70)",
    "--border-soft": "rgba(247,241,227,.24)",
    "--card-radius": "0px",
    "--warm-accent": "#e01b24",
    "--warm-accent-strong": "#9e1018",
    "--warm-border": "#141414",
    "--warm-card": "#fffaf0",
    "--warm-app": "#f7f1e3",
    "--warm-ink": "#141414"
  };

  function apply() {
    var root = document.documentElement;
    root.classList.add("comic-skin");
    for (var k in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, k)) {
        root.style.setProperty(k, vars[k]);
      }
    }
    var shell = document.querySelector(".app-shell");
    if (shell) shell.style.setProperty("--team-color", "#e01b24");
    cleanSettingsMenu();
    cleanTeamNameContribution();
    hideSaveProblemEntry();
    hideNativeCloudSave();
    disableFreeText();
    hidePlayerWatch();
    enhancePosterError();
    applySlotLocks();
    buildLauncherLayout();
  }

  function clearLauncherLayout() {
    var nodes = document.querySelectorAll(
      ".bm-launcher-header, .bm-launcher-eyebrow, .bm-launcher-hero, " +
        ".bm-launcher-archive, .bm-launcher-stats"
    );
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
    }
  }

  function buildLauncherLayout() {
    var shell = document.querySelector(".launcher-shell.home-screen");
    if (!shell) {
      clearLauncherLayout();
      return;
    }
    var center = shell.querySelector(".launcher-center");
    if (!center) return;

    if (!shell.querySelector(".bm-launcher-header")) {
      var header = document.createElement("div");
      header.className = "bm-launcher-header";
      header.innerHTML =
        '<span class="bm-launcher-brand"><i></i>BASKETBALL MANAGER</span>' +
        '<span class="bm-launcher-rule"></span>' +
        '<span class="bm-launcher-meta">CONQUER / LEAGUE</span>';
      shell.insertBefore(header, center);
    }

    if (!shell.querySelector(".bm-launcher-eyebrow")) {
      var eyebrow = document.createElement("div");
      eyebrow.className = "bm-launcher-eyebrow";
      eyebrow.textContent = "扩军建队 · 接管球队 · 改写联盟";
      shell.insertBefore(eyebrow, center);
    }

    if (!shell.querySelector(".bm-launcher-hero")) {
      var hero = document.createElement("figure");
      hero.className = "bm-launcher-hero";
      hero.innerHTML =
        '<img src="./story/startup-court-ball.webp" alt="">' +
        '<span class="bm-hero-tag">COMIC / COURT</span>' +
        '<figcaption class="bm-hero-caption">' +
        "<span>2026 — 2027 · 从扩军开始的经理生涯</span>" +
        "<em>32 TEAMS</em>" +
        "</figcaption>";
      shell.appendChild(hero);
    }

    if (!shell.querySelector(".bm-launcher-archive")) {
      var archive = document.createElement("section");
      archive.className = "bm-launcher-archive";
      archive.innerHTML =
        '<div class="bm-archive-head">' +
        "<b>GAME ARCHIVE / 联盟档案</b>" +
        "<span>2026—2027</span>" +
        "</div>" +
        '<div class="bm-archive-timeline">' +
        '<div class="bm-archive-step"><i></i><b>建队</b><small>EXPANSION</small></div>' +
        '<div class="bm-archive-step"><i></i><b>选秀</b><small>DRAFT</small></div>' +
        '<div class="bm-archive-step"><i></i><b>交易</b><small>MARKET</small></div>' +
        '<div class="bm-archive-step"><i></i><b>赛季</b><small>SEASON</small></div>' +
        '<div class="bm-archive-step"><i></i><b>争冠</b><small>FINALS</small></div>' +
        "</div>";
      shell.appendChild(archive);
    }

    if (!shell.querySelector(".bm-launcher-stats")) {
      var stats = document.createElement("section");
      stats.className = "bm-launcher-stats";
      stats.innerHTML =
        '<div class="bm-stat"><b>32</b><small>支球队</small><em>TEAMS</em></div>' +
        '<div class="bm-stat"><b>82</b><small>场常规赛</small><em>GAMES</em></div>' +
        '<div class="bm-stat"><b>14</b><small>人扩军选秀</small><em>PICKS</em></div>';
      shell.appendChild(stats);
    }
  }

  function disableFreeText() {
    var nodes = document.querySelectorAll(
      'input[type="text"], input[type="search"], textarea, [contenteditable="true"]'
    );
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.setProperty("display", "none", "important");
      nodes[i].setAttribute("aria-hidden", "true");
      nodes[i].setAttribute("tabindex", "-1");
    }
    var numbers = document.querySelectorAll('input[type="number"]');
    for (var j = 0; j < numbers.length; j++) {
      if (numbers[j].hasAttribute("min") || numbers[j].hasAttribute("max")) {
        numbers[j].type = "range";
      } else {
        numbers[j].style.setProperty("display", "none", "important");
        numbers[j].setAttribute("aria-hidden", "true");
      }
    }
  }

  function hidePlayerWatch() {
    var nav = document.querySelector(".league-tabs");
    if (nav) {
      var buttons = nav.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        var text = (buttons[i].textContent || "").replace(/\s+/g, "");
        if (text.indexOf("关注球员") === 0) {
          buttons[i].style.setProperty("display", "none", "important");
          buttons[i].setAttribute("aria-hidden", "true");
        }
      }
    }
    var panel = document.querySelector(".player-watch-panel");
    if (panel) {
      panel.style.setProperty("display", "none", "important");
      panel.setAttribute("aria-hidden", "true");
    }
  }

  function enhancePosterError() {
    var error = document.querySelector(".lineup-competition-error");
    if (!error || error.querySelector(".bm-poster-goto-lineup")) return;
    if ((error.textContent || "").indexOf("阵容轮换") < 0) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "bm-poster-goto-lineup";
    button.textContent = "前往阵容轮换 →";
    button.addEventListener("click", function () {
      var tabs = document.querySelectorAll("button");
      for (var i = 0; i < tabs.length; i++) {
        if ((tabs[i].textContent || "").replace(/\s+/g, "") === "轮换战术") {
          tabs[i].click();
          return;
        }
      }
    });
    error.appendChild(button);
  }

  function cleanSettingsMenu() {
    var options = document.querySelector(".settings-dialog .settings-options");
    if (!options) return;
    var buttons = options.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      var text = (buttons[i].textContent || "").replace(/\s+/g, "");
      if (text.indexOf("玩家反馈") === 0 || text.indexOf("添加到桌面") === 0) {
        buttons[i].style.setProperty("display", "none", "important");
        buttons[i].setAttribute("aria-hidden", "true");
      }
    }
  }

  function cleanTeamNameContribution() {
    var nodes = document.querySelectorAll(
      ".team-name-contribution, .team-name-post-notice"
    );
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.setProperty("display", "none", "important");
      nodes[i].setAttribute("aria-hidden", "true");
    }
  }

  function hideSaveProblemEntry() {
    var nodes = document.querySelectorAll(".save-problem-entry");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.setProperty("display", "none", "important");
      nodes[i].setAttribute("aria-hidden", "true");
      nodes[i].setAttribute("tabindex", "-1");
    }
  }

  function hideNativeCloudSave() {
    /* The native cloud save is a Hupu service; Lamps cloud lives in
       Settings → 云存档. Hide its launcher help entry too. */
    var cloudEntries = document.querySelectorAll(
      ".launcher-cloud-save-summary, .launcher-cloud-save-details"
    );
    for (var c = 0; c < cloudEntries.length; c++) {
      cloudEntries[c].style.setProperty("display", "none", "important");
      cloudEntries[c].setAttribute("aria-hidden", "true");
    }
    var tabs = document.querySelectorAll(
      ".save-drawer-tabs button, .cloud-save-tabs button"
    );
    for (var i = 0; i < tabs.length; i++) {
      var tabText = (tabs[i].textContent || "").replace(/\s+/g, "");
      if (tabText.indexOf("云存档") === 0) {
        tabs[i].style.setProperty("display", "none", "important");
        tabs[i].setAttribute("aria-hidden", "true");
        if (tabs[i].classList.contains("active")) {
          var firstTab = document.querySelector(".save-drawer-tabs button");
          if (firstTab) firstTab.click();
        }
      }
    }

    var links = document.querySelectorAll(".cloud-save-link");
    for (var j = 0; j < links.length; j++) {
      var label = (links[j].textContent || "").replace(/\s+/g, "");
      if (
        label.indexOf("重试云同步") >= 0 ||
        label.indexOf("处理云端冲突") >= 0
      ) {
        links[j].style.setProperty("display", "none", "important");
        links[j].setAttribute("aria-hidden", "true");
      }
    }

    var helps = document.querySelectorAll(".cloud-save-help");
    for (var k = 0; k < helps.length; k++) {
      helps[k].style.setProperty("display", "none", "important");
      helps[k].setAttribute("aria-hidden", "true");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
  function fixContrast() {
    var nodes = document.querySelectorAll('button, [role="button"], .active');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var cs = window.getComputedStyle(el);
      if (cs.color === "rgb(255, 255, 255)") continue;
      var bg = cs.backgroundColor || "";
      var m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) continue;
      var r = +m[1], g = +m[2], b = +m[3];
      if (r > 150 && g < 95 && b < 95) {
        el.style.setProperty("color", "#ffffff", "important");
      }
    }
  }
  var pending = false;
  function scheduleContrast() {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      fixContrast();
      cleanSettingsMenu();
      cleanTeamNameContribution();
      hideSaveProblemEntry();
      hideNativeCloudSave();
      disableFreeText();
      hidePlayerWatch();
      enhancePosterError();
      applySlotLocks();
      buildLauncherLayout();
    }, 350);
  }
  window.addEventListener("load", apply);
  window.addEventListener("load", scheduleContrast);
  setTimeout(apply, 600);
  setTimeout(apply, 1800);
  setTimeout(fixContrast, 900);
  document.addEventListener(
    "click",
    function () {
      setTimeout(cleanSettingsMenu, 30);
      setTimeout(cleanTeamNameContribution, 30);
      setTimeout(hideSaveProblemEntry, 30);
      setTimeout(hideNativeCloudSave, 30);
      setTimeout(disableFreeText, 30);
      setTimeout(hidePlayerWatch, 30);
    },
    true
  );
  if (window.MutationObserver && document.body) {
    new MutationObserver(scheduleContrast).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  /* ---------- draft pick confirmation ---------- */

  var draftConfirm = null;
  var draftConfirmButton = null;
  var draftConfirmFocus = null;

  function draftPlayerName(button) {
    var card = button.closest(
      "article.player-row, article.gemini-prospect-card, article"
    );
    if (!card) return "";
    var name = card.querySelector(
      ".draft-player-title b, .gemini-prospect-copy b, b"
    );
    return name ? (name.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  function closeDraftConfirm() {
    if (!draftConfirm) return;
    if (draftConfirm.parentNode) draftConfirm.parentNode.removeChild(draftConfirm);
    draftConfirm = null;
    draftConfirmButton = null;
    document.documentElement.classList.remove("bm-draft-confirm-open");
    if (draftConfirmFocus && draftConfirmFocus.focus) {
      try {
        draftConfirmFocus.focus({ preventScroll: true });
      } catch (e) {}
    }
    draftConfirmFocus = null;
  }

  function confirmDraftPick() {
    var button = draftConfirmButton;
    closeDraftConfirm();
    if (!button || !button.isConnected || button.disabled) return;
    button.setAttribute("data-bm-draft-confirm", "1");
    button.click();
  }

  function openDraftConfirm(button) {
    if (draftConfirm) return;
    draftConfirmButton = button;
    draftConfirmFocus = document.activeElement;

    var name = draftPlayerName(button);
    var titleText = name
      ? "确认选中 " + name + "？"
      : "确认选中这名球员？";

    var backdrop = document.createElement("div");
    backdrop.className = "bm-draft-confirm-backdrop";
    backdrop.setAttribute("role", "presentation");

    var panel = document.createElement("section");
    panel.className = "bm-draft-confirm";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "bm-draft-confirm-title");

    var head = document.createElement("div");
    head.className = "bm-draft-confirm-head";
    head.innerHTML =
      '<span class="bm-draft-confirm-stamp">DRAFT PICK · 选秀确认</span>';

    var close = document.createElement("button");
    close.type = "button";
    close.className = "bm-draft-confirm-close";
    close.setAttribute("aria-label", "取消");
    close.textContent = "×";
    head.appendChild(close);

    var title = document.createElement("h2");
    title.className = "bm-draft-confirm-title";
    title.id = "bm-draft-confirm-title";
    title.textContent = titleText;

    var body = document.createElement("p");
    body.className = "bm-draft-confirm-body";
    body.textContent = "提交后本次选秀签位立即生效，无法撤销或改选其他球员。";

    var actions = document.createElement("div");
    actions.className = "bm-draft-confirm-actions";

    var cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "bm-draft-confirm-cancel";
    cancel.textContent = "取消";

    var ok = document.createElement("button");
    ok.type = "button";
    ok.className = "bm-draft-confirm-ok";
    ok.textContent = "确认选中";

    actions.appendChild(cancel);
    actions.appendChild(ok);
    panel.appendChild(head);
    panel.appendChild(title);
    panel.appendChild(body);
    panel.appendChild(actions);
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
    draftConfirm = backdrop;
    document.documentElement.classList.add("bm-draft-confirm-open");

    close.addEventListener("click", closeDraftConfirm);
    cancel.addEventListener("click", closeDraftConfirm);
    ok.addEventListener("click", confirmDraftPick);
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) closeDraftConfirm();
    });

    setTimeout(function () {
      try {
        cancel.focus({ preventScroll: true });
      } catch (e) {}
    }, 30);
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("button") : null;
      if (!button) return;
      if (button.getAttribute("data-bm-draft-confirm") === "1") {
        button.removeAttribute("data-bm-draft-confirm");
        return;
      }
      if (button.disabled) return;
      var label = (button.textContent || "").replace(/\s+/g, "");
      if (label !== "选中球员") return;
      if (
        button.closest(
          ".reference-expansion-draft, .prototype-expansion-draft"
        )
      ) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      openDraftConfirm(button);
    },
    true
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (!draftConfirm) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeDraftConfirm();
      }
    },
    true
  );

  /* ---------- expansion draft progress toast ---------- */

  var draftToast = null;
  var draftToastTimer = null;
  var draftSeenCount = null;
  var draftCheckTimer = null;

  function readDraftProgress() {
    var card = document.querySelector(
      ".reference-expansion-draft, .prototype-expansion-draft"
    );
    if (!card) return null;
    var rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    var countEl = card.querySelector(
      ".prototype-draft-heading > span b, .reference-draft-header > span b"
    );
    var capEl = card.querySelector(
      ".draft-cap-meter-heading > span:last-child b"
    );
    if (!countEl || !capEl) return null;

    var match = (countEl.textContent || "").match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return null;

    return {
      current: parseInt(match[1], 10),
      total: parseInt(match[2], 10),
      cap: (capEl.textContent || "").replace(/\s+/g, " ").trim(),
      negative: capEl.classList.contains("negative")
    };
  }

  function showDraftToast(info, delta) {
    if (!document.body) return;

    if (!draftToast || !draftToast.isConnected) {
      draftToast = document.createElement("div");
      draftToast.className = "bm-draft-progress-toast";
      draftToast.setAttribute("role", "status");
      draftToast.setAttribute("aria-live", "polite");
      document.body.appendChild(draftToast);
    }

    var remaining = Math.max(0, info.total - info.current);
    var stamp = document.createElement("span");
    stamp.className = "bm-draft-toast-stamp";
    stamp.textContent = "选秀播报";

    var copy = document.createElement("span");
    copy.className = "bm-draft-toast-copy";

    var headline = document.createElement("b");
    headline.textContent =
      "已选 " +
      info.current +
      " / " +
      info.total +
      (delta > 1 ? " · 本次选入 " + delta + " 人" : "");
    copy.appendChild(headline);

    var detail = document.createElement("span");
    detail.appendChild(document.createTextNode("还需选 "));
    var remain = document.createElement("strong");
    remain.textContent = remaining + " 人";
    detail.appendChild(remain);
    detail.appendChild(document.createTextNode(" · "));
    detail.appendChild(
      document.createTextNode(info.negative ? "已超帽 " : "还剩 ")
    );
    var money = document.createElement("strong");
    money.textContent = info.cap;
    detail.appendChild(money);
    copy.appendChild(detail);

    draftToast.innerHTML = "";
    draftToast.appendChild(stamp);
    draftToast.appendChild(copy);
    draftToast.classList.add("is-on");

    if (draftToastTimer) clearTimeout(draftToastTimer);
    draftToastTimer = setTimeout(function () {
      if (draftToast) draftToast.classList.remove("is-on");
    }, 4400);
  }

  function checkDraftProgress() {
    var info = readDraftProgress();
    if (!info || !info.total) {
      draftSeenCount = null;
      return;
    }
    if (draftSeenCount === null) {
      draftSeenCount = info.current;
      return;
    }
    if (info.current > draftSeenCount) {
      var delta = info.current - draftSeenCount;
      draftSeenCount = info.current;
      showDraftToast(info, delta);
    } else if (info.current < draftSeenCount) {
      draftSeenCount = info.current;
    }
  }

  function scheduleDraftCheck() {
    if (draftCheckTimer) return;
    draftCheckTimer = setTimeout(function () {
      draftCheckTimer = null;
      checkDraftProgress();
      applySlotLocks();
      syncExpansionStage();
      syncFreeAgentAffordability();
      syncRookiePreview();
      syncRoleSwap();
      syncUntouchable();
      syncBreakthrough();
      buildLauncherLayout();
    }, 120);
  }

  if (window.MutationObserver && document.body) {
    new MutationObserver(scheduleDraftCheck).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* ---------- save slot unlock (slots 4-6) ---------- */

  var SLOT_DB_NAME = "bm-save-slot-unlocks";
  var SLOT_DB_STORE = "state";
  var SLOT_DB_KEY = "unlocked";
  var SLOT_LS_KEY = "bm:save-slots:unlocked";
  var SLOT_LOCK_LABEL = "🔒 看视频解锁";
  var unlockedSlotIds = [];
  var slotDbPromise = null;
  var slotUnlockModal = null;
  var slotUnlockSlot = 0;
  var slotUnlockBusy = false;
  var slotUnlockFocus = null;
  var slotToast = null;
  var slotToastTimer = null;

  function isSlotUnlocked(slot) {
    return slot <= 3 || unlockedSlotIds.indexOf(slot) >= 0;
  }

  function slotDbOpen() {
    if (slotDbPromise) return slotDbPromise;
    slotDbPromise = new Promise(function (resolve, reject) {
      try {
        var request = window.indexedDB.open(SLOT_DB_NAME, 1);
        request.onupgradeneeded = function () {
          var db = request.result;
          if (!db.objectStoreNames.contains(SLOT_DB_STORE)) {
            db.createObjectStore(SLOT_DB_STORE);
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
    return slotDbPromise;
  }

  function slotDbGet() {
    return slotDbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(SLOT_DB_STORE, "readonly");
        var request = tx.objectStore(SLOT_DB_STORE).get(SLOT_DB_KEY);
        request.onsuccess = function () {
          resolve(request.result || null);
        };
        request.onerror = function () {
          reject(request.error);
        };
      });
    });
  }

  function slotDbSet(value) {
    return slotDbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(SLOT_DB_STORE, "readwrite");
        tx.objectStore(SLOT_DB_STORE).put(value, SLOT_DB_KEY);
        tx.oncomplete = function () {
          resolve();
        };
        tx.onerror = function () {
          reject(tx.error);
        };
      });
    });
  }

  function normalizeSlotIds(value) {
    if (!Array.isArray(value)) return null;
    var result = [];
    for (var i = 0; i < value.length; i++) {
      var slot = parseInt(value[i], 10);
      if (slot >= 4 && slot <= 6 && result.indexOf(slot) < 0) result.push(slot);
    }
    return result;
  }

  function readUnlockedSlotsFromLs() {
    try {
      var raw = window.localStorage.getItem(SLOT_LS_KEY);
      if (!raw) return [];
      return normalizeSlotIds(JSON.parse(raw)) || [];
    } catch (e) {
      return [];
    }
  }

  function persistUnlockedSlots() {
    var snapshot = unlockedSlotIds.slice();
    try {
      window.localStorage.setItem(SLOT_LS_KEY, JSON.stringify(snapshot));
    } catch (e) {}
    slotDbSet(snapshot).catch(function () {});
  }

  function loadUnlockedSlots() {
    slotDbGet()
      .then(function (value) {
        var ids = normalizeSlotIds(value);
        if (!ids) ids = readUnlockedSlotsFromLs();
        unlockedSlotIds = ids;
        applySlotLocks();
      })
      .catch(function () {
        unlockedSlotIds = readUnlockedSlotsFromLs();
        applySlotLocks();
      });
  }

  function slotNumberFromCard(card) {
    var heading = card.querySelector(
      ".save-slot-card-heading b, .save-mode-heading b"
    );
    var text = heading ? heading.textContent || "" : card.textContent || "";
    var match = text.match(/槽位\s*0?(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  function slotActionButtons(card) {
    var result = [];
    var nodes = card.querySelectorAll(
      ".cloud-slot-button-row > button, .save-rebuild-actions > button, .home-load-confirm-actions > button"
    );
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (
        node.classList.contains("cloud-save-link") ||
        node.classList.contains("save-rebuild-cancel") ||
        node.classList.contains("home-load-cancel")
      ) {
        continue;
      }
      result.push(node);
    }
    for (var j = 0; j < card.children.length; j++) {
      if (card.children[j].tagName === "BUTTON") {
        result.push(card.children[j]);
      }
    }
    return result;
  }

  function applySlotLocks() {
    /* Live base unlocks slots through the native rewarded-video flow, which
       the Lamps bridge already powers. Do not replace it with the legacy
       six-slot overlay. */
    return;
    var cards = document.querySelectorAll(
      ".save-slot-card, .home-load-slots > article"
    );
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var slot = slotNumberFromCard(card);
      if (!slot) continue;
      var locked = !isSlotUnlocked(slot);
      var badge = card.querySelector(".bm-slot-lock-badge");
      var buttons = slotActionButtons(card);

      if (locked) {
        card.classList.add("bm-slot-locked");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "bm-slot-lock-badge";
          badge.textContent = "🔒 未解锁";
          var heading = card.querySelector(
            ".save-slot-card-heading, .save-mode-heading"
          );
          if (heading) heading.appendChild(badge);
          else card.appendChild(badge);
        }
        for (var j = 0; j < buttons.length; j++) {
          var button = buttons[j];
          if (!button.getAttribute("data-bm-slot-label")) {
            button.setAttribute(
              "data-bm-slot-label",
              (button.textContent || "").trim()
            );
          }
          if (button.textContent !== SLOT_LOCK_LABEL) {
            button.textContent = SLOT_LOCK_LABEL;
          }
        }
      } else {
        card.classList.remove("bm-slot-locked");
        if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
        for (var k = 0; k < buttons.length; k++) {
          var unlockedButton = buttons[k];
          var original = unlockedButton.getAttribute("data-bm-slot-label");
          if (original !== null) {
            if (unlockedButton.textContent === SLOT_LOCK_LABEL) {
              unlockedButton.textContent = original;
            }
            unlockedButton.removeAttribute("data-bm-slot-label");
          }
        }
      }
    }
  }

  function setSlotUnlockStatus(message, kind) {
    if (!slotUnlockModal) return;
    var status = slotUnlockModal.querySelector(".bm-slot-unlock-status");
    if (!status) return;
    status.textContent = message || "";
    status.className =
      "bm-slot-unlock-status" + (kind ? " is-" + kind : "");
  }

  function closeSlotUnlockModal() {
    if (!slotUnlockModal) return;
    if (slotUnlockModal.parentNode) {
      slotUnlockModal.parentNode.removeChild(slotUnlockModal);
    }
    slotUnlockModal = null;
    slotUnlockSlot = 0;
    slotUnlockBusy = false;
    document.documentElement.classList.remove("bm-slot-unlock-open");
    if (slotUnlockFocus && slotUnlockFocus.focus) {
      try {
        slotUnlockFocus.focus({ preventScroll: true });
      } catch (e) {}
    }
    slotUnlockFocus = null;
  }

  function showSlotUnlockToast(slot) {
    if (!document.body) return;
    if (!slotToast || !slotToast.isConnected) {
      slotToast = document.createElement("div");
      slotToast.className = "bm-draft-progress-toast";
      slotToast.setAttribute("role", "status");
      slotToast.setAttribute("aria-live", "polite");
      document.body.appendChild(slotToast);
    }
    var stamp = document.createElement("span");
    stamp.className = "bm-draft-toast-stamp";
    stamp.textContent = "已解锁";
    var copy = document.createElement("span");
    copy.className = "bm-draft-toast-copy";
    var title = document.createElement("b");
    title.textContent = "槽位 0" + slot + " 现在可用";
    var detail = document.createElement("span");
    detail.textContent = "现在可以保存或读取这个位置。";
    copy.appendChild(title);
    copy.appendChild(detail);
    slotToast.innerHTML = "";
    slotToast.appendChild(stamp);
    slotToast.appendChild(copy);
    slotToast.classList.add("is-on");
    if (slotToastTimer) clearTimeout(slotToastTimer);
    slotToastTimer = setTimeout(function () {
      if (slotToast) slotToast.classList.remove("is-on");
    }, 3200);
  }

  function finishSlotUnlockError(message) {
    slotUnlockBusy = false;
    if (!slotUnlockModal) return;
    var ok = slotUnlockModal.querySelector(".bm-draft-confirm-ok");
    var cancel = slotUnlockModal.querySelector(".bm-draft-confirm-cancel");
    if (ok) {
      ok.disabled = false;
      ok.textContent = "看视频解锁";
    }
    if (cancel) cancel.disabled = false;
    setSlotUnlockStatus(message, "error");
  }

  function unlockSlot(slot) {
    if (slotUnlockBusy || !slotUnlockModal) return;
    var api = window.LampsGame;
    if (!api || typeof api.showRewardedVideo !== "function") {
      setSlotUnlockStatus("激励视频暂不可用，请稍后重试。", "error");
      return;
    }

    slotUnlockBusy = true;
    var ok = slotUnlockModal.querySelector(".bm-draft-confirm-ok");
    var cancel = slotUnlockModal.querySelector(".bm-draft-confirm-cancel");
    if (ok) {
      ok.disabled = true;
      ok.textContent = "正在播放视频…";
    }
    if (cancel) cancel.disabled = true;
    setSlotUnlockStatus("正在播放视频…", "busy");

    var request;
    try {
      request = api.showRewardedVideo({
        source: "unlock-save-slot"
      });
    } catch (e) {
      finishSlotUnlockError(
        (e && e.message) || "激励视频暂不可用，请稍后重试。"
      );
      return;
    }

    Promise.resolve(request)
      .then(function (result) {
        if (result && result.ok) {
          if (unlockedSlotIds.indexOf(slot) < 0) {
            unlockedSlotIds.push(slot);
            unlockedSlotIds.sort();
            persistUnlockedSlots();
          }
          closeSlotUnlockModal();
          applySlotLocks();
          showSlotUnlockToast(slot);
          return;
        }
        finishSlotUnlockError(
          (result && result.message) || "激励视频未完成，槽位未解锁。"
        );
      })
      .catch(function (error) {
        finishSlotUnlockError(
          (error && error.message) || "激励视频暂不可用，请稍后重试。"
        );
      });
  }

  function openSlotUnlockModal(slot) {
    if (slotUnlockModal || isSlotUnlocked(slot)) return;
    slotUnlockSlot = slot;
    slotUnlockBusy = false;
    slotUnlockFocus = document.activeElement;

    var backdrop = document.createElement("div");
    backdrop.className = "bm-draft-confirm-backdrop bm-slot-unlock-backdrop";
    backdrop.setAttribute("role", "presentation");

    var panel = document.createElement("section");
    panel.className = "bm-draft-confirm bm-slot-unlock";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "bm-slot-unlock-title");

    var head = document.createElement("div");
    head.className = "bm-draft-confirm-head";
    head.innerHTML =
      '<span class="bm-draft-confirm-stamp">SAVE SLOT · 槽位解锁</span>';

    var close = document.createElement("button");
    close.type = "button";
    close.className = "bm-draft-confirm-close";
    close.setAttribute("aria-label", "取消");
    close.textContent = "×";
    head.appendChild(close);

    var title = document.createElement("h2");
    title.className = "bm-draft-confirm-title";
    title.id = "bm-slot-unlock-title";
    title.textContent = "解锁存档槽位 0" + slot;

    var body = document.createElement("p");
    body.className = "bm-draft-confirm-body";
    body.textContent =
      "观看一段激励视频即可解锁这个存档位置，解锁后永久可用。每个槽位只需解锁一次。";

    var status = document.createElement("p");
    status.className = "bm-slot-unlock-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    var actions = document.createElement("div");
    actions.className = "bm-draft-confirm-actions";

    var cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "bm-draft-confirm-cancel";
    cancel.textContent = "取消";

    var ok = document.createElement("button");
    ok.type = "button";
    ok.className = "bm-draft-confirm-ok";
    ok.textContent = "看视频解锁";

    actions.appendChild(cancel);
    actions.appendChild(ok);
    panel.appendChild(head);
    panel.appendChild(title);
    panel.appendChild(body);
    panel.appendChild(status);
    panel.appendChild(actions);
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
    slotUnlockModal = backdrop;
    document.documentElement.classList.add("bm-slot-unlock-open");

    close.addEventListener("click", function () {
      if (!slotUnlockBusy) closeSlotUnlockModal();
    });
    cancel.addEventListener("click", function () {
      if (!slotUnlockBusy) closeSlotUnlockModal();
    });
    ok.addEventListener("click", function () {
      unlockSlot(slot);
    });
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop && !slotUnlockBusy) {
        closeSlotUnlockModal();
      }
    });

    setTimeout(function () {
      try {
        cancel.focus({ preventScroll: true });
      } catch (e) {}
    }, 30);
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("button") : null;
      if (!button) return;
      if (
        button.classList.contains("cloud-save-link") ||
        button.classList.contains("save-rebuild-cancel") ||
        button.classList.contains("home-load-cancel") ||
        button.classList.contains("save-problem-entry")
      ) {
        return;
      }
      var card = button.closest(".save-slot-card, .home-load-slots > article");
      if (!card || !card.classList.contains("bm-slot-locked")) return;
      var slot = slotNumberFromCard(card);
      if (!slot || isSlotUnlocked(slot)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openSlotUnlockModal(slot);
    },
    true
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (!slotUnlockModal) return;
      if (event.key === "Escape" && !slotUnlockBusy) {
        event.preventDefault();
        closeSlotUnlockModal();
      }
    },
    true
  );

  loadUnlockedSlots();


  /* ---------- pre-lottery rookie preview ---------- */

  var rookiePreviewModal = null;
  var rookiePreviewData = null;

  function closeRookiePreview() {
    if (!rookiePreviewModal) return;
    rookiePreviewModal.remove();
    rookiePreviewModal = null;
    rookiePreviewData = null;
    document.documentElement.classList.remove("bm-rookie-preview-open");
  }

  function openRookiePreview() {
    var provider = window.__BM_ROOKIE_PREVIEW__;
    var data = null;
    if (typeof provider === "function") {
      try {
        data = provider();
      } catch (e) {
        data = null;
      }
    }
    closeRookiePreview();
    rookiePreviewData = data;
    document.documentElement.classList.add("bm-rookie-preview-open");

    var backdrop = document.createElement("div");
    backdrop.className = "bm-rookie-preview-backdrop";
    backdrop.setAttribute("role", "presentation");

    var dialog = document.createElement("section");
    dialog.className = "bm-rookie-preview-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "新秀预览");

    var head = document.createElement("header");
    var headCopy = document.createElement("div");
    var kicker = document.createElement("small");
    kicker.textContent = "DRAFT CLASS / 新秀预览";
    var title = document.createElement("b");
    title.textContent =
      data && data.year ? data.year + " 届新秀" : "本届新秀";
    headCopy.appendChild(kicker);
    headCopy.appendChild(title);
    var close = document.createElement("button");
    close.type = "button";
    close.className = "bm-rookie-preview-close";
    close.setAttribute("aria-label", "关闭新秀预览");
    close.textContent = "×";
    close.addEventListener("click", closeRookiePreview);
    head.appendChild(headCopy);
    head.appendChild(close);

    var summary = document.createElement("p");
    summary.className = "bm-rookie-preview-summary";
    var list = document.createElement("div");
    list.className = "bm-rookie-preview-list";

    if (!data || !data.players || !data.players.length) {
      summary.textContent = "暂无新秀数据，请进入选秀准备页后再试。";
    } else {
      var players = data.players.slice().sort(function (a, b) {
        return (b.overall || 0) - (a.overall || 0);
      });
      summary.textContent =
        "共 " + players.length + " 人 · 按 OVR 排序 · 潜力为球探估计";
      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var row = document.createElement("article");
        row.className = "bm-rookie-preview-row";

        var rank = document.createElement("span");
        rank.className = "bm-rookie-preview-rank";
        rank.textContent = String(i + 1).padStart(2, "0");

        var copy = document.createElement("div");
        copy.className = "bm-rookie-preview-copy";
        var name = document.createElement("b");
        name.textContent = p.name || p.id;
        var meta = document.createElement("small");
        meta.textContent =
          (p.position || "—") +
          " · " +
          (p.age != null ? p.age + " 岁" : "年龄 —") +
          " · 潜力 " +
          (p.potential || "—");
        copy.appendChild(name);
        copy.appendChild(meta);

        var ovr = document.createElement("span");
        ovr.className = "bm-rookie-preview-ovr";
        ovr.textContent = "OVR " + (p.overall != null ? p.overall : "—");

        row.appendChild(rank);
        row.appendChild(copy);
        row.appendChild(ovr);
        list.appendChild(row);
      }
    }

    dialog.appendChild(head);
    dialog.appendChild(summary);
    dialog.appendChild(list);
    backdrop.appendChild(dialog);
    backdrop.addEventListener("mousedown", function (event) {
      if (event.target === backdrop) closeRookiePreview();
    });
    document.body.appendChild(backdrop);
    rookiePreviewModal = backdrop;
  }

  function syncRookiePreview() {
    if (typeof window.__BM_ROOKIE_PREVIEW__ !== "function") return;
    var card = document.querySelector(".rookie-draft-prep-terminal");
    if (!card) return;
    var existing = card.querySelector(".bm-rookie-preview-trigger");
    if (existing) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "bm-rookie-preview-trigger";
    button.textContent = "查看新秀";
    button.addEventListener("click", openRookiePreview);
    var host = card.querySelector(".draft-prep-metrics");
    if (host && host.parentNode) {
      host.parentNode.insertBefore(button, host.nextSibling);
    } else {
      var hero = card.querySelector(".draft-prep-hero");
      if (hero) hero.appendChild(button);
      else card.appendChild(button);
    }
  }

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape" && rookiePreviewModal) {
        closeRookiePreview();
      }
    },
    true
  );


  /* ---------- team role swap ---------- */

  var ROLE_LABELS = {
    FRANCHISE_CORE: "建队核心",
    KEY_PLAYER: "重要主力",
    SIXTH_MAN: "第六人",
    ROTATION: "普通轮换",
    DEVELOPMENT: "重点培养",
    BENCH: "边缘球员"
  };

  var roleSwapModal = null;
  var roleSwapSelected = [];

  function roleSwapLabel(role) {
    return ROLE_LABELS[role] || role || "—";
  }

  function closeRoleSwap() {
    if (!roleSwapModal) return;
    roleSwapModal.remove();
    roleSwapModal = null;
    roleSwapSelected = [];
    document.documentElement.classList.remove("bm-role-swap-open");
  }

  function openRoleSwap() {
    var provider = window.__BM_ROLE_SWAP_DATA__;
    var action = window.__BM_SWAP_ROLES__;
    if (typeof provider !== "function" || typeof action !== "function") return;
    var players = [];
    try {
      players = provider() || [];
    } catch (e) {
      players = [];
    }
    closeRoleSwap();
    roleSwapSelected = [];
    document.documentElement.classList.add("bm-role-swap-open");

    var backdrop = document.createElement("div");
    backdrop.className = "bm-role-swap-backdrop";
    backdrop.setAttribute("role", "presentation");

    var dialog = document.createElement("section");
    dialog.className = "bm-role-swap-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "球队定位互换");

    var head = document.createElement("header");
    var copy = document.createElement("div");
    var kicker = document.createElement("small");
    kicker.textContent = "ROLE SWAP / 签约定位";
    var title = document.createElement("b");
    title.textContent = "球队定位互换";
    copy.appendChild(kicker);
    copy.appendChild(title);
    var close = document.createElement("button");
    close.type = "button";
    close.className = "bm-role-swap-close";
    close.setAttribute("aria-label", "关闭定位互换");
    close.textContent = "×";
    close.addEventListener("click", closeRoleSwap);
    head.appendChild(copy);
    head.appendChild(close);

    var summary = document.createElement("p");
    summary.className = "bm-role-swap-summary";
    summary.textContent = "选择两名球员交换签约定位。有定位承诺的球员需先重新协商。";

    var list = document.createElement("div");
    list.className = "bm-role-swap-list";
    var confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "bm-role-swap-confirm";
    confirm.textContent = "请选择两名球员";
    confirm.disabled = true;
    var status = document.createElement("p");
    status.className = "bm-role-swap-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    function renderSelection() {
      var rows = list.querySelectorAll(".bm-role-swap-row");
      for (var i = 0; i < rows.length; i++) {
        var id = rows[i].getAttribute("data-player-id");
        rows[i].classList.toggle(
          "is-selected",
          roleSwapSelected.indexOf(id) >= 0
        );
      }
      confirm.disabled = roleSwapSelected.length !== 2;
      confirm.textContent =
        roleSwapSelected.length === 2
          ? "确认互换定位"
          : "请选择两名球员（" + roleSwapSelected.length + "/2）";
    }

    players.sort(function (a, b) {
      return (b.overall || 0) - (a.overall || 0);
    });
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      var row = document.createElement("button");
      row.type = "button";
      row.className = "bm-role-swap-row";
      row.setAttribute("data-player-id", p.id);
      if (p.commitment) {
        row.disabled = true;
        row.classList.add("has-commitment");
      }
      var name = document.createElement("b");
      name.textContent = p.name || p.id;
      var meta = document.createElement("small");
      meta.textContent =
        roleSwapLabel(p.role) +
        (p.commitment ? " · 有定位承诺，暂不可互换" : " · 点击选择");
      var ovr = document.createElement("span");
      ovr.textContent = "OVR " + (p.overall != null ? p.overall : "—");
      row.appendChild(name);
      row.appendChild(meta);
      row.appendChild(ovr);
      row.addEventListener("click", function (event) {
        var id = event.currentTarget.getAttribute("data-player-id");
        var at = roleSwapSelected.indexOf(id);
        if (at >= 0) {
          roleSwapSelected.splice(at, 1);
        } else {
          if (roleSwapSelected.length >= 2) roleSwapSelected.shift();
          roleSwapSelected.push(id);
        }
        status.textContent = "";
        renderSelection();
      });
      list.appendChild(row);
    }

    confirm.addEventListener("click", function () {
      if (roleSwapSelected.length !== 2) return;
      confirm.disabled = true;
      confirm.textContent = "正在提交…";
      status.textContent = "";
      var result;
      try {
        result = action(roleSwapSelected[0], roleSwapSelected[1]);
      } catch (e) {
        status.textContent = (e && e.message) || "定位互换失败";
        renderSelection();
        return;
      }
      Promise.resolve(result)
        .then(function () {
          status.textContent = "定位已互换，正在保存…";
          setTimeout(closeRoleSwap, 700);
        })
        .catch(function (e) {
          status.textContent = (e && e.message) || "定位互换失败";
          renderSelection();
        });
    });

    dialog.appendChild(head);
    dialog.appendChild(summary);
    dialog.appendChild(list);
    dialog.appendChild(status);
    dialog.appendChild(confirm);
    backdrop.appendChild(dialog);
    backdrop.addEventListener("mousedown", function (event) {
      if (event.target === backdrop) closeRoleSwap();
    });
    document.body.appendChild(backdrop);
    roleSwapModal = backdrop;
    renderSelection();
  }

  function syncRoleSwap() {
    var host = document.querySelector("#season-roster");
    if (!host) return;
    if (typeof window.__BM_SWAP_ROLES__ !== "function") return;
    if (host.querySelector(".bm-role-swap-trigger")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "bm-role-swap-trigger";
    button.textContent = "定位互换（签约定位）";
    button.addEventListener("click", openRoleSwap);
    host.insertBefore(button, host.firstChild);
  }

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape" && roleSwapModal) {
        closeRoleSwap();
      }
    },
    true
  );


  /* ---------- user untouchable players ---------- */

  var untouchableModal = null;
  var untouchableBusy = false;

  function closeUntouchable() {
    if (!untouchableModal) return;
    untouchableModal.remove();
    untouchableModal = null;
    untouchableBusy = false;
    document.documentElement.classList.remove("bm-role-swap-open");
  }

  function openUntouchable() {
    var provider = window.__BM_UNTOUCHABLE_DATA__;
    var action = window.__BM_SET_UNTOUCHABLE__;
    if (typeof provider !== "function" || typeof action !== "function") return;
    var data = null;
    try {
      data = provider();
    } catch (e) {
      data = null;
    }
    if (!data) return;
    closeRoleSwap();
    closeUntouchable();
    untouchableBusy = false;
    document.documentElement.classList.add("bm-role-swap-open");

    var backdrop = document.createElement("div");
    backdrop.className = "bm-role-swap-backdrop";
    backdrop.setAttribute("role", "presentation");
    var dialog = document.createElement("section");
    dialog.className = "bm-role-swap-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "非卖品设置");

    var head = document.createElement("header");
    var copy = document.createElement("div");
    var kicker = document.createElement("small");
    kicker.textContent = "UNTOUCHABLE / 非卖品";
    var title = document.createElement("b");
    title.textContent = "非卖品设置";
    copy.appendChild(kicker);
    copy.appendChild(title);
    var close = document.createElement("button");
    close.type = "button";
    close.className = "bm-role-swap-close";
    close.setAttribute("aria-label", "关闭非卖品设置");
    close.textContent = "×";
    close.addEventListener("click", closeUntouchable);
    head.appendChild(copy);
    head.appendChild(close);

    var summary = document.createElement("p");
    summary.className = "bm-role-swap-summary";
    var list = document.createElement("div");
    list.className = "bm-role-swap-list";
    var status = document.createElement("p");
    status.className = "bm-role-swap-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    function currentCount() {
      var n = 0;
      var rows = list.querySelectorAll(".bm-role-swap-row");
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].getAttribute("data-untouchable") === "1") n++;
      }
      return n;
    }

    function refreshSummary() {
      summary.textContent =
        "最多 " +
        data.limit +
        " 名非卖品（当前 " +
        currentCount() +
        " 名）。非卖品会被 AI 视为不可交易。" ;
    }

    var players = (data.players || []).slice().sort(function (a, b) {
      return (b.overall || 0) - (a.overall || 0);
    });
    for (var i = 0; i < players.length; i++) {
      (function (p) {
        var row = document.createElement("button");
        row.type = "button";
        row.className = "bm-role-swap-row";
        row.setAttribute("data-player-id", p.id);
        row.setAttribute("data-untouchable", p.untouchable ? "1" : "0");
        if (p.untouchable) row.classList.add("is-untouchable");
        var name = document.createElement("b");
        name.textContent = p.name || p.id;
        var meta = document.createElement("small");
        meta.textContent =
          roleSwapLabel(p.role) + " · " + (p.untouchable ? "非卖品" : "可交易");
        var ovr = document.createElement("span");
        ovr.textContent = "OVR " + (p.overall != null ? p.overall : "—");
        row.appendChild(name);
        row.appendChild(meta);
        row.appendChild(ovr);
        row.addEventListener("click", function () {
          if (untouchableBusy) return;
          var on = row.getAttribute("data-untouchable") === "1";
          if (!on && currentCount() >= data.limit) {
            status.textContent =
              "免费非卖品名额已满（" + data.limit + " 人），请先取消一名。";
            return;
          }
          untouchableBusy = true;
          row.disabled = true;
          status.textContent = on ? "正在取消非卖品…" : "正在设为非卖品…";
          var result;
          try {
            result = action(p.id, !on);
          } catch (e) {
            row.disabled = false;
            untouchableBusy = false;
            status.textContent = (e && e.message) || "设置失败";
            return;
          }
          Promise.resolve(result)
            .then(function () {
              row.setAttribute("data-untouchable", on ? "0" : "1");
              row.classList.toggle("is-untouchable", !on);
              row.querySelector("small").textContent =
                roleSwapLabel(p.role) + " · " + (on ? "可交易" : "非卖品");
              row.disabled = false;
              untouchableBusy = false;
              status.textContent = on ? "已取消非卖品" : "已设为非卖品";
              refreshSummary();
            })
            .catch(function (e) {
              row.disabled = false;
              untouchableBusy = false;
              status.textContent = (e && e.message) || "设置失败";
            });
        });
        list.appendChild(row);
      })(players[i]);
    }

    dialog.appendChild(head);
    dialog.appendChild(summary);
    dialog.appendChild(list);
    dialog.appendChild(status);
    backdrop.appendChild(dialog);
    backdrop.addEventListener("mousedown", function (event) {
      if (event.target === backdrop) closeUntouchable();
    });
    document.body.appendChild(backdrop);
    untouchableModal = backdrop;
    refreshSummary();
  }

  function syncUntouchable() {
    var host = document.querySelector("#season-roster");
    if (!host) return;
    if (typeof window.__BM_SET_UNTOUCHABLE__ !== "function") return;
    if (host.querySelector(".bm-untouchable-trigger")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "bm-untouchable-trigger";
    button.textContent = "非卖品设置";
    button.addEventListener("click", openUntouchable);
    var swap = host.querySelector(".bm-role-swap-trigger");
    if (swap && swap.parentNode) swap.parentNode.insertBefore(button, swap);
    else host.insertBefore(button, host.firstChild);
  }

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape" && untouchableModal) {
        closeUntouchable();
      }
    },
    true
  );

  /* ---------- offseason breakthrough training ---------- */

  var breakthroughModal = null;
  var breakthroughSelected = null;
  var breakthroughBusy = false;

  function closeBreakthrough() {
    if (!breakthroughModal) return;
    breakthroughModal.remove();
    breakthroughModal = null;
    breakthroughSelected = null;
    breakthroughBusy = false;
    document.documentElement.classList.remove("bm-role-swap-open");
  }

  function openBreakthrough() {
    var provider = window.__BM_BREAKTHROUGH_DATA__;
    var action = window.__BM_BREAKTHROUGH_TRAINING__;
    if (typeof provider !== "function" || typeof action !== "function") return;
    var data = null;
    try {
      data = provider();
    } catch (e) {
      data = null;
    }
    if (!data) return;
    closeRoleSwap();
    closeUntouchable();
    closeBreakthrough();
    breakthroughSelected = null;
    breakthroughBusy = false;
    document.documentElement.classList.add("bm-role-swap-open");

    var backdrop = document.createElement("div");
    backdrop.className = "bm-role-swap-backdrop";
    backdrop.setAttribute("role", "presentation");
    var dialog = document.createElement("section");
    dialog.className = "bm-role-swap-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "突破训练");

    var head = document.createElement("header");
    var copy = document.createElement("div");
    var kicker = document.createElement("small");
    kicker.textContent = "BREAKTHROUGH / 突破训练";
    var title = document.createElement("b");
    title.textContent = "突破训练";
    copy.appendChild(kicker);
    copy.appendChild(title);
    var close = document.createElement("button");
    close.type = "button";
    close.className = "bm-role-swap-close";
    close.setAttribute("aria-label", "关闭突破训练");
    close.textContent = "×";
    close.addEventListener("click", closeBreakthrough);
    head.appendChild(copy);
    head.appendChild(close);

    var summary = document.createElement("p");
    summary.className = "bm-role-swap-summary";
    summary.textContent = data.done
      ? "本赛季已完成突破训练，下赛季休赛期可再次安排。"
      : "每赛季一次，选择一名 27 岁及以下球员，潜力 +2（最高 99），开季生效。";

    var list = document.createElement("div");
    list.className = "bm-role-swap-list";
    var status = document.createElement("p");
    status.className = "bm-role-swap-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    var confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "bm-role-swap-confirm";
    confirm.textContent = "请选择一名球员";
    confirm.disabled = true;

    function renderSelection() {
      var rows = list.querySelectorAll(".bm-role-swap-row");
      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.toggle(
          "is-selected",
          rows[i].getAttribute("data-player-id") === breakthroughSelected
        );
      }
      confirm.disabled = !breakthroughSelected || data.done;
      confirm.textContent = data.done
        ? "本赛季已完成"
        : breakthroughSelected
        ? "确认突破训练"
        : "请选择一名球员";
    }

    var players = (data.players || []).slice().sort(function (a, b) {
      return (b.overall || 0) - (a.overall || 0);
    });
    for (var i = 0; i < players.length; i++) {
      (function (p) {
        var row = document.createElement("button");
        row.type = "button";
        row.className = "bm-role-swap-row";
        row.setAttribute("data-player-id", p.id);
        if (data.done) row.disabled = true;
        var name = document.createElement("b");
        name.textContent = p.name || p.id;
        var meta = document.createElement("small");
        meta.textContent =
          roleSwapLabel(p.role) +
          " · " +
          (p.age != null ? p.age + " 岁" : "年龄 —") +
          " · 潜力 " +
          (p.potential != null ? p.potential : "—");
        var ovr = document.createElement("span");
        ovr.textContent = "OVR " + (p.overall != null ? p.overall : "—");
        row.appendChild(name);
        row.appendChild(meta);
        row.appendChild(ovr);
        row.addEventListener("click", function () {
          if (data.done || breakthroughBusy) return;
          breakthroughSelected = p.id;
          status.textContent = "";
          renderSelection();
        });
        list.appendChild(row);
      })(players[i]);
    }

    confirm.addEventListener("click", function () {
      if (!breakthroughSelected || data.done || breakthroughBusy) return;
      breakthroughBusy = true;
      confirm.disabled = true;
      confirm.textContent = "正在训练…";
      status.textContent = "正在提交突破训练…";
      var result;
      try {
        result = action(breakthroughSelected);
      } catch (e) {
        breakthroughBusy = false;
        status.textContent = (e && e.message) || "突破训练失败";
        renderSelection();
        return;
      }
      Promise.resolve(result)
        .then(function () {
          setTimeout(function () {
            var latest = null;
            try {
              latest = provider();
            } catch (e) {
              latest = null;
            }
            if (latest && latest.done) {
              status.textContent = "突破训练完成，潜力已提升，开季生效。";
              setTimeout(closeBreakthrough, 1000);
              return;
            }
            breakthroughBusy = false;
            status.textContent =
              "突破训练未完成：只能在休赛期或季前训练营进行，且每赛季仅一次。";
            renderSelection();
          }, 900);
        })
        .catch(function (e) {
          breakthroughBusy = false;
          status.textContent = (e && e.message) || "突破训练失败";
          renderSelection();
        });
    });

    dialog.appendChild(head);
    dialog.appendChild(summary);
    dialog.appendChild(list);
    dialog.appendChild(status);
    dialog.appendChild(confirm);
    backdrop.appendChild(dialog);
    backdrop.addEventListener("mousedown", function (event) {
      if (event.target === backdrop) closeBreakthrough();
    });
    document.body.appendChild(backdrop);
    breakthroughModal = backdrop;
    renderSelection();
  }

  function syncBreakthrough() {
    var host = document.querySelector("#season-roster");
    if (!host) return;
    if (typeof window.__BM_BREAKTHROUGH_TRAINING__ !== "function") return;
    if (host.querySelector(".bm-breakthrough-trigger")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "bm-breakthrough-trigger";
    button.textContent = "突破训练（休赛期）";
    button.addEventListener("click", openBreakthrough);
    var swap = host.querySelector(".bm-role-swap-trigger");
    if (swap && swap.parentNode) swap.parentNode.insertBefore(button, swap);
    else host.insertBefore(button, host.firstChild);
  }

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape" && breakthroughModal) {
        closeBreakthrough();
      }
    },
    true
  );


  /* ---------- expansion draft: staged 14-man board ---------- */

  var expansionStage = {
    active: false,
    legacy: false,
    base: 0,
    total: 14,
    picks: [],
    panel: null,
    busy: false,
    preview: null,
    affordable: null,
    previewTimer: null,
    previewKey: "",
    chipKey: "__none__",
    message: "",
    toast: null,
    toastTimer: null
  };

  function formatWan(value) {
    if (typeof value !== "number" || !isFinite(value)) return "—";
    var wan = Math.round(value / 10000);
    return wan.toLocaleString("zh-CN") + " 万美元";
  }

  /* ---------- free agency: cap-space blocked offers ---------- */

  function isCapBlockedOffer(row) {
    var status = row.querySelector(".fa-player-status-line");
    var text = status ? status.textContent || "" : "";
    return (
      text.indexOf("可用薪资空间不足") >= 0 ||
      text.indexOf("薪资空间不足") >= 0 ||
      text.indexOf("帽下空间不足") >= 0
    );
  }

  function syncFreeAgentAffordability() {
    var rows = document.querySelectorAll(
      ".fa-reference-player-list .fa-reference-player-card"
    );
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var button = row.querySelector(".fa-offer-button");
      if (!button) continue;
      var blocked = isCapBlockedOffer(row);
      if (blocked) {
        if (!button.hasAttribute("data-bm-fa-label")) {
          button.setAttribute(
            "data-bm-fa-label",
            (button.textContent || "").trim()
          );
          button.setAttribute(
            "data-bm-fa-disabled",
            button.disabled ? "1" : "0"
          );
        }
        if (button.textContent !== "资金不足") {
          button.textContent = "资金不足";
        }
        button.disabled = true;
        button.style.setProperty("color", "#6e6960", "important");
        button.classList.add("bm-fa-unaffordable");
        row.classList.add("bm-fa-unaffordable-row");
      } else if (button.hasAttribute("data-bm-fa-label")) {
        var original = button.getAttribute("data-bm-fa-label");
        if (button.textContent === "资金不足") {
          button.textContent = original || "发起报价";
          button.disabled =
            button.getAttribute("data-bm-fa-disabled") === "1";
          button.style.removeProperty("color");
        }
        button.removeAttribute("data-bm-fa-label");
        button.removeAttribute("data-bm-fa-disabled");
        button.classList.remove("bm-fa-unaffordable");
        row.classList.remove("bm-fa-unaffordable-row");
      }
    }
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      var button =
        target && target.closest
          ? target.closest(".fa-reference-player-card .bm-fa-unaffordable")
          : null;
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true
  );

  function expansionDraftCard() {
    /* free agency reuses .reference-expansion-draft for layout; only the real
       expansion draft card carries .prototype-expansion-draft */
    var card = document.querySelector(".prototype-expansion-draft");
    if (!card) return null;
    var rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return card;
  }

  function expansionCount(card) {
    var el = card.querySelector(
      ".prototype-draft-heading > span b, .reference-draft-header > span b"
    );
    if (!el) return null;
    var match = (el.textContent || "").match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return null;
    return {
      current: parseInt(match[1], 10),
      total: parseInt(match[2], 10),
      el: el
    };
  }

  function expansionBaseCount(card) {
    var summary = card.querySelector(
      ".draft-current-roster-panel summary small"
    );
    if (summary) {
      var match = (summary.textContent || "").match(/(\d+)\s*\/\s*(\d+)\s*人/);
      if (match) {
        return {
          current: parseInt(match[1], 10),
          total: parseInt(match[2], 10)
        };
      }
    }
    return expansionCount(card);
  }

  function expansionRowTeam(row, card) {
    var selector = document.querySelector(".draft-team-selector-button b");
    var selected = selector ? (selector.textContent || "").trim() : "";
    if (selected && selected !== "全部球队") return selected;
    var em = row.querySelector(".draft-player-title em");
    var emText = em ? (em.textContent || "").trim() : "";
    var parts = emText.split("·");
    return parts.length >= 2 ? parts[0].trim() : "";
  }

  function expansionPlayerInfo(button, card) {
    var testId = button.getAttribute("data-testid") || "";
    var id = testId.slice("draft-player-select-".length);
    if (!id) return null;
    var row = button.closest(".player-row") || card;
    var nameEl = row.querySelector(".draft-player-title b");
    var name = nameEl ? (nameEl.textContent || "").trim() : id;
    var stats = row.querySelector(".draft-player-stats");
    var statsText = stats ? stats.textContent || "" : "";
    var salaryMatch = statsText.match(/年薪\s*([\d,]+)/);
    var ovrMatch = statsText.match(/OVR\s*(\d+)/);

    return {
      id: id,
      name: name,
      salary: salaryMatch
        ? parseInt(salaryMatch[1].replace(/,/g, ""), 10)
        : null,
      ovr: ovrMatch ? parseInt(ovrMatch[1], 10) : null,
      team: expansionRowTeam(row, card)
    };
  }

  function syncExpansionCards(card) {
    var stagedTeams = {};
    for (var p = 0; p < expansionStage.picks.length; p++) {
      if (expansionStage.picks[p].team) {
        stagedTeams[expansionStage.picks[p].team] = true;
      }
    }

    var buttons = card.querySelectorAll(
      'button[data-testid^="draft-player-select-"]'
    );
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      var id = (button.getAttribute("data-testid") || "").slice(
        "draft-player-select-".length
      );
      var row = button.closest(".player-row");
      var staged = false;
      for (var j = 0; j < expansionStage.picks.length; j++) {
        if (expansionStage.picks[j].id === id) {
          staged = true;
          break;
        }
      }
      var team = row ? expansionRowTeam(row, card) : "";
      var teamUsed = !!(team && stagedTeams[team]);
      var affordable = true;
      if (
        expansionStage.affordable &&
        Object.prototype.hasOwnProperty.call(expansionStage.affordable, id)
      ) {
        affordable = expansionStage.affordable[id] !== false;
      }
      var maxed =
        expansionStage.base + expansionStage.picks.length >=
        expansionStage.total;
      var blockedLabel = "";
      if (!staged && !teamUsed) {
        if (maxed) blockedLabel = "已选满";
        else if (!affordable) blockedLabel = "资金不足";
      }

      if (staged || teamUsed || blockedLabel) {
        if (!button.hasAttribute("data-bm-expansion-label")) {
          button.setAttribute(
            "data-bm-expansion-label",
            (button.textContent || "").trim()
          );
        }
        if (row) {
          row.classList.toggle("bm-expansion-staged", staged);
          row.classList.toggle("bm-expansion-team-used", teamUsed && !staged);
          row.classList.toggle(
            "bm-expansion-unaffordable",
            !staged && !teamUsed && blockedLabel === "资金不足"
          );
          row.classList.toggle(
            "bm-expansion-full",
            !staged && !teamUsed && blockedLabel === "已选满"
          );
        }
        var label = staged ? "已选" : teamUsed ? "同队已选" : blockedLabel;
        if (button.textContent !== label) button.textContent = label;
      } else {
        if (row) {
          row.classList.remove("bm-expansion-staged");
          row.classList.remove("bm-expansion-team-used");
          row.classList.remove("bm-expansion-unaffordable");
          row.classList.remove("bm-expansion-full");
        }
        var original = button.getAttribute("data-bm-expansion-label");
        if (original !== null) {
          if (
            button.textContent === "已选" ||
            button.textContent === "同队已选" ||
            button.textContent === "资金不足" ||
            button.textContent === "已选满"
          ) {
            button.textContent = original;
          }
          button.removeAttribute("data-bm-expansion-label");
        }
      }
    }
  }

  function updateExpansionPanel() {
    var panel = expansionStage.panel;
    if (!panel) return;
    var totalSelected = expansionStage.base + expansionStage.picks.length;
    var remaining = Math.max(0, expansionStage.total - totalSelected);
    var count = panel.querySelector(".bm-expansion-stage-count");
    if (count) {
      var countText =
        "已选 " +
        totalSelected +
        " / " +
        expansionStage.total +
        " · 还需 " +
        remaining +
        " 人";
      if (count.textContent !== countText) count.textContent = countText;
    }

    var chips = panel.querySelector(".bm-expansion-stage-chips");
    var chipKey = "";
    for (var c = 0; c < expansionStage.picks.length; c++) {
      var item = expansionStage.picks[c];
      chipKey +=
        item.id +
        ":" +
        item.name +
        ":" +
        item.salary +
        ":" +
        item.team +
        "|";
    }
    if (chips && expansionStage.chipKey !== chipKey) {
      expansionStage.chipKey = chipKey;
      chips.innerHTML = "";
      if (expansionStage.picks.length === 0) {
        var empty = document.createElement("span");
        empty.className = "bm-expansion-stage-empty";
        empty.textContent =
          "从下方选秀池点击「选中球员」，先加入名单，选满后再确认。";
        chips.appendChild(empty);
      } else {
        for (var i = 0; i < expansionStage.picks.length; i++) {
          var pick = expansionStage.picks[i];
          var chip = document.createElement("span");
          chip.className = "bm-expansion-chip";
          var name = document.createElement("b");
          name.textContent = pick.name;
          var meta = document.createElement("small");
          meta.textContent =
            (pick.salary != null ? pick.salary + " 万" : "年薪 —") +
            (pick.team ? " · " + pick.team : "");
          var remove = document.createElement("button");
          remove.type = "button";
          remove.className = "bm-expansion-chip-remove";
          remove.setAttribute("data-id", pick.id);
          remove.setAttribute("aria-label", "移除 " + pick.name);
          remove.textContent = "×";
          chip.appendChild(name);
          chip.appendChild(meta);
          chip.appendChild(remove);
          chips.appendChild(chip);
        }
      }
    }

    var cap = panel.querySelector(".bm-expansion-stage-cap");
    if (cap) {
      var preview = expansionStage.preview;
      var capText;
      var capClass = "bm-expansion-stage-cap";
      if (preview && preview.ok) {
        var space = preview.availableCapSpace;
        capText =
          space < 0
            ? "预选后预计超帽 " + formatWan(-space)
            : "预选后预计剩余 " + formatWan(space);
        if (space < 0) capClass += " is-over";
      } else if (preview && preview.message) {
        capText = "预计剩余 —";
        capClass += " is-over";
      } else {
        capText = "正在计算剩余空间…";
      }
      if (cap.textContent !== capText) cap.textContent = capText;
      if (cap.className !== capClass) cap.className = capClass;
    }

    var note = panel.querySelector(".bm-expansion-stage-note");
    if (note) {
      var noteText =
        expansionStage.base > 0
          ? "队内已有 " +
            expansionStage.base +
            " 人（协议入队），还需再选 " +
            remaining +
            " 人。"
          : "选中的球员先进入待确认名单，不会立刻加入球队。";
      if (note.textContent !== noteText) note.textContent = noteText;
    }

    var error = panel.querySelector(".bm-expansion-stage-error");
    if (error) {
      var message = expansionStage.message;
      if (!message && expansionStage.preview && !expansionStage.preview.ok) {
        message = expansionStage.preview.message || "选秀名单还未通过校验。";
      }
      var errorText = message || "";
      if (error.textContent !== errorText) error.textContent = errorText;
      var errorDisplay = message ? "block" : "none";
      if (error.style.display !== errorDisplay) {
        error.style.display = errorDisplay;
      }
    }

    var confirm = panel.querySelector(".bm-expansion-stage-confirm");
    if (confirm) {
      var ready =
        !expansionStage.busy &&
        remaining === 0 &&
        !!expansionStage.preview &&
        expansionStage.preview.ok;
      var confirmText = expansionStage.busy
        ? "正在确认…"
        : "确定最终选秀结果";
      if (confirm.disabled !== !ready) confirm.disabled = !ready;
      if (confirm.textContent !== confirmText) {
        confirm.textContent = confirmText;
      }
    }
    var clear = panel.querySelector(".bm-expansion-stage-clear");
    if (clear) {
      var clearDisabled =
        expansionStage.busy || expansionStage.picks.length === 0;
      if (clear.disabled !== clearDisabled) clear.disabled = clearDisabled;
    }
  }

  function runExpansionPreview() {
    if (!expansionStage.active) return;
    var previewFn =
      window.__BM_EXPANSION_AFFORDABILITY__ ||
      window.__BM_EXPANSION_PREVIEW__;
    if (typeof previewFn !== "function") {
      expansionStage.preview = {
        ok: false,
        message: "正在准备选秀校验…"
      };
      expansionStage.affordable = null;
      updateExpansionPanel();
      return;
    }
    var ids = [];
    for (var i = 0; i < expansionStage.picks.length; i++) {
      ids.push(expansionStage.picks[i].id);
    }
    try {
      var result = previewFn(ids);
      expansionStage.preview = result || {
        ok: false,
        message: "选秀校验没有返回结果。"
      };
      expansionStage.affordable =
        result && result.affordable ? result.affordable : null;
    } catch (e) {
      expansionStage.preview = {
        ok: false,
        message: (e && e.message) || "选秀名单校验失败。"
      };
      expansionStage.affordable = null;
    }
    updateExpansionPanel();
    var card = expansionDraftCard();
    if (card && expansionStage.active) syncExpansionCards(card);
  }

  function scheduleExpansionPreview() {
    if (expansionStage.previewTimer) clearTimeout(expansionStage.previewTimer);
    expansionStage.previewTimer = setTimeout(function () {
      expansionStage.previewTimer = null;
      runExpansionPreview();
    }, 180);
  }

  function expansionPanelAction(action) {
    if (!expansionStage.active || expansionStage.busy) return;
    if (action === "clear") {
      expansionStage.picks = [];
      expansionStage.message = "";
      expansionStage.previewKey = "";
      expansionStage.affordable = null;
      syncExpansionStage();
      scheduleExpansionPreview();
    }
  }

  function showExpansionToast(message) {
    if (!document.body) return;
    if (!expansionStage.toast || !expansionStage.toast.isConnected) {
      expansionStage.toast = document.createElement("div");
      expansionStage.toast.className = "bm-draft-progress-toast";
      expansionStage.toast.setAttribute("role", "status");
      expansionStage.toast.setAttribute("aria-live", "polite");
      document.body.appendChild(expansionStage.toast);
    }
    var stamp = document.createElement("span");
    stamp.className = "bm-draft-toast-stamp";
    stamp.textContent = "选秀结果";
    var copy = document.createElement("span");
    copy.className = "bm-draft-toast-copy";
    var title = document.createElement("b");
    title.textContent = message;
    var detail = document.createElement("span");
    detail.textContent = "最终名单已经提交，正在生成选秀结果。";
    copy.appendChild(title);
    copy.appendChild(detail);
    expansionStage.toast.innerHTML = "";
    expansionStage.toast.appendChild(stamp);
    expansionStage.toast.appendChild(copy);
    expansionStage.toast.classList.add("is-on");
    if (expansionStage.toastTimer) clearTimeout(expansionStage.toastTimer);
    expansionStage.toastTimer = setTimeout(function () {
      if (expansionStage.toast) {
        expansionStage.toast.classList.remove("is-on");
      }
    }, 3600);
  }

  function confirmExpansionStage() {
    if (!expansionStage.active || expansionStage.busy) return;
    var totalSelected = expansionStage.base + expansionStage.picks.length;
    if (totalSelected < expansionStage.total) {
      expansionStage.message =
        "还需选择 " + (expansionStage.total - totalSelected) + " 名球员。";
      updateExpansionPanel();
      return;
    }
    if (!expansionStage.preview || !expansionStage.preview.ok) {
      expansionStage.message =
        (expansionStage.preview && expansionStage.preview.message) ||
        "选秀名单还未通过校验。";
      updateExpansionPanel();
      return;
    }
    var confirmFn = window.__BM_EXPANSION_CONFIRM__;
    if (typeof confirmFn !== "function") {
      expansionStage.message = "最终确认功能暂不可用，请刷新后重试。";
      updateExpansionPanel();
      return;
    }

    expansionStage.busy = true;
    expansionStage.message = "";
    updateExpansionPanel();
    var ids = [];
    for (var i = 0; i < expansionStage.picks.length; i++) {
      ids.push(expansionStage.picks[i].id);
    }

    Promise.resolve(confirmFn(ids))
      .then(function (result) {
        if (result === false) {
          expansionStage.busy = false;
          expansionStage.message = "最终确认失败，请检查名单后重试。";
          updateExpansionPanel();
          return;
        }
        expansionStage.busy = false;
        draftSeenCount = null;
        showExpansionToast("最终选秀结果已确认");
        resetExpansionStage();
      })
      .catch(function (error) {
        expansionStage.busy = false;
        expansionStage.message =
          (error && error.message) || "最终确认失败，请重试。";
        updateExpansionPanel();
      });
  }

  function buildExpansionPanel() {
    if (expansionStage.panel) return;
    var panel = document.createElement("section");
    panel.className = "bm-expansion-stage";
    panel.setAttribute("aria-label", "待确认选秀名单");

    var head = document.createElement("div");
    head.className = "bm-expansion-stage-head";
    var stamp = document.createElement("span");
    stamp.className = "bm-expansion-stage-stamp";
    stamp.textContent = "选秀名单 · 待确认";
    var count = document.createElement("b");
    count.className = "bm-expansion-stage-count";
    head.appendChild(stamp);
    head.appendChild(count);

    var chips = document.createElement("div");
    chips.className = "bm-expansion-stage-chips";

    var foot = document.createElement("div");
    foot.className = "bm-expansion-stage-foot";
    var cap = document.createElement("span");
    cap.className = "bm-expansion-stage-cap";
    var actions = document.createElement("div");
    actions.className = "bm-expansion-stage-actions";
    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "bm-expansion-stage-clear";
    clear.textContent = "清空";
    var confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "bm-expansion-stage-confirm";
    confirm.textContent = "确定最终选秀结果";
    confirm.disabled = true;
    actions.appendChild(clear);
    actions.appendChild(confirm);
    foot.appendChild(cap);
    foot.appendChild(actions);

    var note = document.createElement("p");
    note.className = "bm-expansion-stage-note";
    var error = document.createElement("p");
    error.className = "bm-expansion-stage-error";
    error.setAttribute("role", "alert");
    error.style.display = "none";

    panel.appendChild(head);
    panel.appendChild(chips);
    panel.appendChild(foot);
    panel.appendChild(note);
    panel.appendChild(error);
    document.body.appendChild(panel);
    expansionStage.panel = panel;
    document.documentElement.classList.add("bm-expansion-staging");

    clear.addEventListener("click", function () {
      expansionPanelAction("clear");
    });
    confirm.addEventListener("click", function () {
      confirmExpansionStage();
    });
    chips.addEventListener("click", function (event) {
      var button =
        event.target && event.target.closest
          ? event.target.closest(".bm-expansion-chip-remove")
          : null;
      if (!button || expansionStage.busy) return;
      var id = button.getAttribute("data-id");
      var next = [];
      for (var i = 0; i < expansionStage.picks.length; i++) {
        if (expansionStage.picks[i].id !== id) {
          next.push(expansionStage.picks[i]);
        }
      }
      expansionStage.picks = next;
      expansionStage.message = "";
      expansionStage.previewKey = "";
      expansionStage.affordable = null;
      syncExpansionStage();
      scheduleExpansionPreview();
    });
  }

  function resetExpansionStage() {
    if (!expansionStage.active && !expansionStage.panel) return;
    expansionStage.active = false;
    expansionStage.legacy = false;
    expansionStage.base = 0;
    expansionStage.picks = [];
    expansionStage.busy = false;
    expansionStage.preview = null;
    expansionStage.affordable = null;
    expansionStage.previewKey = "";
    expansionStage.chipKey = "__none__";
    expansionStage.message = "";
    if (expansionStage.previewTimer) {
      clearTimeout(expansionStage.previewTimer);
      expansionStage.previewTimer = null;
    }
    if (expansionStage.panel && expansionStage.panel.parentNode) {
      expansionStage.panel.parentNode.removeChild(expansionStage.panel);
    }
    expansionStage.panel = null;
    document.documentElement.classList.remove("bm-expansion-staging");

    var rows = document.querySelectorAll(
      ".reference-expansion-draft .player-row.bm-expansion-staged, " +
        ".reference-expansion-draft .player-row.bm-expansion-team-used, " +
        ".reference-expansion-draft .player-row.bm-expansion-unaffordable, " +
        ".reference-expansion-draft .player-row.bm-expansion-full, " +
        ".prototype-expansion-draft .player-row.bm-expansion-staged, " +
        ".prototype-expansion-draft .player-row.bm-expansion-team-used, " +
        ".prototype-expansion-draft .player-row.bm-expansion-unaffordable, " +
        ".prototype-expansion-draft .player-row.bm-expansion-full"
    );
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.remove("bm-expansion-staged");
      rows[i].classList.remove("bm-expansion-team-used");
      rows[i].classList.remove("bm-expansion-unaffordable");
      rows[i].classList.remove("bm-expansion-full");
    }
    var buttons = document.querySelectorAll(
      'button[data-testid^="draft-player-select-"][data-bm-expansion-label]'
    );
    for (var j = 0; j < buttons.length; j++) {
      var button = buttons[j];
      var original = button.getAttribute("data-bm-expansion-label");
      if (
        original !== null &&
        (button.textContent === "已选" ||
          button.textContent === "同队已选" ||
          button.textContent === "资金不足" ||
          button.textContent === "已选满")
      ) {
        button.textContent = original;
      }
      button.removeAttribute("data-bm-expansion-label");
    }
  }

  function initExpansionStage(card) {
    var check = window.__BM_EXPANSION_USER_FIRST__;
    if (typeof check !== "function") {
      expansionStage.legacy = true;
      expansionStage.active = false;
      return;
    }
    try {
      if (!check()) {
        expansionStage.legacy = true;
        expansionStage.active = false;
        return;
      }
    } catch (e) {}
    expansionStage.legacy = false;
    var count = expansionBaseCount(card);
    if (!count || count.current >= count.total) return;
    expansionStage.active = true;
    expansionStage.base = count.current;
    expansionStage.total = count.total;
    expansionStage.picks = [];
    expansionStage.busy = false;
    expansionStage.preview = null;
    expansionStage.affordable = null;
    expansionStage.previewKey = "";
    expansionStage.chipKey = "__none__";
    expansionStage.message = "";
    buildExpansionPanel();
    scheduleExpansionPreview();
  }

  function syncExpansionStage() {
    var card = expansionDraftCard();
    if (!card) {
      expansionStage.legacy = false;
      if (expansionStage.active) resetExpansionStage();
      return;
    }
    if (expansionStage.legacy) return;
    if (!expansionStage.active) initExpansionStage(card);
    if (expansionStage.legacy || !expansionStage.active) return;
    if (expansionStage.busy) {
      syncExpansionCards(card);
      updateExpansionPanel();
      return;
    }

    var count = expansionCount(card);
    if (count && count.el) {
      var headerText =
        expansionStage.base +
        expansionStage.picks.length +
        " / " +
        expansionStage.total;
      if (count.el.textContent !== headerText) {
        count.el.textContent = headerText;
      }
    }
    syncExpansionCards(card);
    updateExpansionPanel();

    var key = expansionStage.picks
      .map(function (pick) {
        return pick.id;
      })
      .join(",");
    if (key !== expansionStage.previewKey) {
      expansionStage.previewKey = key;
      scheduleExpansionPreview();
    }
  }

  document.addEventListener(
    "click",
    function (event) {
      if (typeof window.__BM_EXPANSION_USER_FIRST__ !== "function") return;
      var target = event.target;
      var button =
        target && target.closest
          ? target.closest('button[data-testid^="draft-player-select-"]')
          : null;
      if (!button) return;
      var card = button.closest(
        ".reference-expansion-draft, .prototype-expansion-draft"
      );
      if (!card) return;
      if (!expansionStage.active && !expansionStage.legacy) {
        initExpansionStage(card);
      }
      if (expansionStage.legacy) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!expansionStage.active || expansionStage.busy) return;

      var info = expansionPlayerInfo(button, card);
      if (!info) return;
      var existing = -1;
      for (var i = 0; i < expansionStage.picks.length; i++) {
        if (expansionStage.picks[i].id === info.id) {
          existing = i;
          break;
        }
      }
      if (existing >= 0) {
        expansionStage.picks.splice(existing, 1);
        expansionStage.message = "";
        expansionStage.previewKey = "";
        syncExpansionStage();
        scheduleExpansionPreview();
        return;
      }

      if (
        expansionStage.base + expansionStage.picks.length >=
        expansionStage.total
      ) {
        expansionStage.message = "名单已满，请先移除一名球员再更换。";
        updateExpansionPanel();
        return;
      }
      if (info.team) {
        for (var j = 0; j < expansionStage.picks.length; j++) {
          if (expansionStage.picks[j].team === info.team) {
            expansionStage.message =
              "同一支球队只能选择 1 名球员：" + info.team;
            updateExpansionPanel();
            return;
          }
        }
      }

      if (
        expansionStage.affordable &&
        Object.prototype.hasOwnProperty.call(
          expansionStage.affordable,
          info.id
        ) &&
        expansionStage.affordable[info.id] === false
      ) {
        expansionStage.message =
          "资金不足：选中该球员会超过扩军选秀工资帽限制。";
        updateExpansionPanel();
        return;
      }

      var previewFn = window.__BM_EXPANSION_PREVIEW__;
      if (typeof previewFn === "function") {
        var nextIds = [];
        for (var k = 0; k < expansionStage.picks.length; k++) {
          nextIds.push(expansionStage.picks[k].id);
        }
        nextIds.push(info.id);
        var check;
        try {
          check = previewFn(nextIds);
        } catch (e) {
          check = { ok: false, message: (e && e.message) || "" };
        }
        if (!check || !check.ok) {
          var checkMessage =
            (check && check.message) ||
            "选中该球员会超过扩军选秀工资帽限制。";
          expansionStage.message =
            checkMessage.indexOf("工资帽") >= 0 ||
            checkMessage.indexOf("薪资") >= 0 ||
            checkMessage.indexOf("上限") >= 0
              ? "资金不足：" + checkMessage
              : checkMessage;
          updateExpansionPanel();
          return;
        }
      }

      expansionStage.affordable = null;
      expansionStage.picks.push(info);
      expansionStage.message = "";
      expansionStage.previewKey = "";
      syncExpansionStage();
      scheduleExpansionPreview();
    },
    true
  );
})();
