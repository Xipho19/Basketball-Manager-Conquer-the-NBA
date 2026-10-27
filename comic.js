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
    disableFreeText();
    hidePlayerWatch();
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
      disableFreeText();
      hidePlayerWatch();
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
})();
