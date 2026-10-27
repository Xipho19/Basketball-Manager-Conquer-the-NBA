/* ============================================================
   Lamps platform integration for the basketball manager game.
   Capabilities: game progress (cloud save), leaderboard, rewarded video.
   The game bundle is not modified; hooks live at the document boundary.
   ============================================================ */
(function (window, document) {
  "use strict";

  var DB_NAME = "basketball-franchise-manager";
  var DB_STORE = "career-saves";
  var CAREER_PREFIX = "basketball-manager:career:";
  var FORCE_KEY = "lamps:force";
  var CHANNEL = "hoorah-minigame-sandbox";

  var rewardTimer = null;
  var rewardAttempts = 0;
  var leaderboardInstalled = false;
  var saveUiInstalled = false;
  var panel = null;
  var panelParts = null;
  var recordsBySlot = {};
  var pendingRestore = null;
  var observer = null;
  var injectTimer = null;
  var rankCache = null;
  var rankCacheAt = 0;
  var rankPromise = null;
  var rankTimer = null;

  function lampsActive() {
    if (window.__LAMPS_DEV__ === true) return true;
    try {
      if (window.localStorage && window.localStorage.getItem(FORCE_KEY) === "1") return true;
    } catch (_) {}
    return /LampsSDK/i.test((window.navigator && window.navigator.userAgent) || "");
  }

  function hasProgressApi() {
    return !!(
      window.LampsPlatform &&
      typeof window.LampsPlatform.saveGameProgress === "function" &&
      typeof window.LampsPlatform.getGameProgress === "function"
    );
  }

  function hasLeaderboardApi() {
    return !!(
      window.LampsPlatform &&
      typeof window.LampsPlatform.submitLeaderboardScore === "function" &&
      typeof window.LampsPlatform.getLeaderboard === "function" &&
      typeof window.LampsPlatform.getMyLeaderboardRecord === "function"
    );
  }

  function hasRewardedVideoApi() {
    return !!(
      window.LampsGame &&
      typeof window.LampsGame.showRewardedVideo === "function"
    );
  }

  function text(value) {
    return value == null ? "" : String(value);
  }

  function toInt(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? Math.trunc(number) : fallback;
  }

  function setStatus(element, message, kind) {
    if (!element) return;
    element.textContent = message || "";
    element.className =
      "lamps-cloud-status" + (kind ? " is-" + kind : "");
  }

  /* ------------------------------------------------------------------
     Rewarded video
     ------------------------------------------------------------------ */

  function installRewardedVideo() {
    if (!lampsActive() || !hasRewardedVideoApi()) return;
    if (rewardTimer) clearTimeout(rewardTimer);

    function attach() {
      var colorbox = window.ColorboxAI;
      if (!colorbox || typeof colorbox !== "object") {
        rewardAttempts++;
        if (rewardAttempts < 150) {
          rewardTimer = setTimeout(attach, 200);
        }
        return;
      }
      var vatask = colorbox.vatask;
      if (!vatask || typeof vatask !== "object") {
        vatask = {};
        try {
          colorbox.vatask = vatask;
        } catch (_) {
          return;
        }
      }
      if (vatask.__lampsRewardedVideo) return;
      vatask.__lampsRewardedVideo = true;
      vatask.completeRewardVideo = function () {
        var request;
        try {
          request = window.LampsGame.showRewardedVideo({
            source: "game-reward",
          });
        } catch (error) {
          return Promise.resolve({
            code: -1,
            message: "激励视频暂不可用，请稍后重试。",
            data: { rewarded: false, reason: "REQUEST_FAILED" },
          });
        }
        return Promise.resolve(request)
          .then(function (result) {
            if (result && result.ok) {
              return { code: 200, data: { rewarded: true } };
            }
            var code = result && result.code ? String(result.code) : "";
            var reason = "REQUEST_FAILED";
            if (code === "APP_REQUIRED") {
              reason = "APP_REQUIRED";
            } else if (code === "NOT_REWARDED") {
              reason = "NOT_REWARDED";
            } else if (code === "UNAVAILABLE" || /^200[1-9]$/.test(code)) {
              reason = "UNAVAILABLE";
            } else if (code === "REWARD_FLOW_FAILED") {
              reason = "REWARD_FLOW_FAILED";
            }
            return {
              code: -1,
              message:
                (result && result.message) ||
                "激励视频未完成，暂未解锁奖励。",
              data: { rewarded: false, reason: reason },
            };
          })
          .catch(function (error) {
            return {
              code: -1,
              message:
                (error && error.message) || "激励视频暂不可用，请稍后重试。",
              data: { rewarded: false, reason: "REQUEST_FAILED" },
            };
          });
      };
    }

    attach();
  }

  /* ------------------------------------------------------------------
     Leaderboard bridge
     ------------------------------------------------------------------ */

  function isLeaderboardFrame(source) {
    var frame;
    try {
      frame = document.querySelector(".leaderboard-overlay iframe");
    } catch (_) {
      return false;
    }
    return !!frame && frame.contentWindow === source;
  }

  function replyToLeaderboard(source, origin, id, data, error) {
    if (!source || origin !== window.location.origin) return;
    var message = {
      type: "basketball-manager:leaderboard-response",
      id: id,
    };
    if (error) message.error = text(error);
    else message.data = data == null ? null : data;
    try {
      source.postMessage(message, origin);
    } catch (_) {}
  }

  function proofPayload(submission) {
    var proof = (submission && submission.proof) || {};
    var championships = Math.max(
      0,
      toInt(proof.championships, 0)
    );
    var completedSeasons = Array.isArray(proof.seasons)
      ? proof.seasons.length
      : Math.max(0, toInt(proof.completedSeasons, 0));
    var rate =
      completedSeasons > 0 ? championships / completedSeasons : 0;
    var displayName =
      text(proof.displayName).trim() ||
      text(submission && submission.displayName).trim() ||
      "经理";
    if (displayName === "虎扑经理") displayName = "经理";
    var dataLoad = {
      displayName: displayName,
      avatarUrl: text(submission && submission.avatarUrl),
      teamName: text(proof.teamName),
      teamLogo: text(proof.teamLogo),
      title: text(proof.title),
      seasonId: text(proof.seasonId),
      championships: championships,
      achievements: Array.isArray(proof.achievements)
        ? proof.achievements.length
        : 0,
      completedSeasons: completedSeasons,
      championshipRate: rate,
      careerSnapshotVerified: true,
    };
    return {
      proof: proof,
      dataLoad: dataLoad,
      score: Math.max(0, toInt(proof.score, 0)),
      championships: championships,
      rateScore: Math.max(0, Math.round(rate * 10000)),
      rateEligible: completedSeasons >= 10,
    };
  }

  function submitProof(submission) {
    var payload = proofPayload(submission);
    var scoreResult = window.LampsPlatform.submitLeaderboardScore(
      payload.score,
      "score",
      payload.dataLoad
    );
    var extra = [
      window.LampsPlatform.submitLeaderboardScore(
        payload.championships,
        "championships",
        payload.dataLoad
      ),
    ];
    if (payload.rateEligible) {
      extra.push(
        window.LampsPlatform.submitLeaderboardScore(
          payload.rateScore,
          "championshipRate",
          payload.dataLoad
        )
      );
    }
    return Promise.resolve(scoreResult).then(function (result) {
      if (!result || !result.ok) {
        throw new Error(
          (result && result.message) || "成绩同步失败，请稍后重试。"
        );
      }
      return Promise.all(
        extra.map(function (promise) {
          return Promise.resolve(promise).catch(function () {
            return null;
          });
        })
      ).then(function () {
        return window.LampsPlatform.getMyLeaderboardRecord("score");
      });
    }).then(function (recordResult) {
      var record =
        recordResult && recordResult.ok && recordResult.data
          ? recordResult.data.record
          : null;
      var base = payload.dataLoad;
      return {
        id: "__me__",
        rank: record && Number.isSafeInteger(record.rank) ? record.rank : null,
        score: record && Number.isFinite(Number(record.score))
          ? Number(record.score)
          : payload.score,
        metric: "score",
        displayName: (record && record.nickname) || base.displayName,
        avatarUrl: base.avatarUrl,
        teamName: base.teamName,
        teamLogo: base.teamLogo,
        seasonId: base.seasonId,
        title: base.title,
        championships: base.championships,
        achievements: base.achievements,
        completedSeasons: base.completedSeasons,
        championshipRate: base.championshipRate,
        careerSnapshotVerified: true,
      };
    });
  }

  function listBoard(metric) {
    return window.LampsPlatform.getLeaderboard(metric).then(function (result) {
      if (!result || !result.ok) {
        throw new Error(
          (result && result.message) || "榜单暂不可用，请稍后重试。"
        );
      }
      var list =
        result.data && Array.isArray(result.data.list)
          ? result.data.list
          : [];
      var entries = list.map(function (entry) {
        var load = entry && entry.dataLoad ? entry.dataLoad : {};
        var id = entry && entry.isCurrentUser
          ? "__me__"
          : text(entry && entry.nickname) + "#" + text(entry && entry.rank);
        return {
          id: id,
          rank: entry && entry.rank,
          score: entry && entry.score,
          displayName: (entry && entry.nickname) || "经理",
          avatarUrl: text(load.avatarUrl),
          teamName: text(load.teamName),
          teamLogo: text(load.teamLogo),
          seasonId: text(load.seasonId),
          title: text(load.title) || "称号待同步",
          championships: load.championships,
          achievements: load.achievements,
          completedSeasons: load.completedSeasons,
          championshipRate: load.championshipRate,
          careerSnapshotVerified: load.careerSnapshotVerified === true,
          isCurrentUser: !!(entry && entry.isCurrentUser),
        };
      });
      return { metric: metric, entries: entries };
    });
  }

  function myRecord(metric) {
    return window.LampsPlatform.getMyLeaderboardRecord(metric).then(function (result) {
      if (!result || !result.ok) {
        throw new Error(
          (result && result.message) || "个人排名暂不可用。"
        );
      }
      var record = result.data && result.data.record;
      if (!record) return null;
      var load = record.dataLoad || {};
      return {
        id: "__me__",
        rank: record.rank,
        score: record.score,
        metric: metric,
        displayName: record.nickname || text(load.displayName) || "经理",
        avatarUrl: text(load.avatarUrl),
        teamName: text(load.teamName),
        teamLogo: text(load.teamLogo),
        seasonId: text(load.seasonId),
        title: text(load.title) || "称号待同步",
        championships: load.championships,
        achievements: load.achievements,
        completedSeasons: load.completedSeasons,
        championshipRate: load.championshipRate,
        careerSnapshotVerified: load.careerSnapshotVerified === true,
      };
    });
  }

  function handleLeaderboardRequest(request, source, origin) {
    var action = request.action;
    var submission = request.submission || {};
    var metric = submission.metric || "score";
    if (metric !== "score" && metric !== "championships" && metric !== "championshipRate") {
      metric = "score";
    }

    var task;
    if (action === "submit") {
      task = submitProof(submission);
    } else if (action === "list") {
      task = listBoard(metric);
    } else if (action === "mine") {
      task = myRecord(metric);
    } else {
      task = Promise.reject(new Error("不支持的排行榜请求。"));
    }

    Promise.resolve(task)
      .then(function (data) {
        replyToLeaderboard(source, origin, request.id, data, null);
      })
      .catch(function (error) {
        replyToLeaderboard(
          source,
          origin,
          request.id,
          null,
          (error && error.message) || "榜单请求失败。"
        );
      });
  }

  function installLeaderboard() {
    if (leaderboardInstalled || !lampsActive() || !hasLeaderboardApi()) return;
    leaderboardInstalled = true;
    window.addEventListener(
      "message",
      function (event) {
        var data = event.data;
        if (!data || typeof data !== "object") return;
        if (data.type !== "basketball-manager:leaderboard-request") return;
        if (event.origin !== window.location.origin) return;
        if (!isLeaderboardFrame(event.source)) return;
        event.stopImmediatePropagation();
        handleLeaderboardRequest(data, event.source, event.origin);
      },
      true
    );
  }

  /* ------------------------------------------------------------------
     Career overview rank panel
     ------------------------------------------------------------------ */

  function rankRecord(result) {
    if (!result || !result.ok || !result.data || !result.data.record) {
      return null;
    }
    var record = result.data.record;
    return {
      record: record,
      load: record.dataLoad || {},
    };
  }

  function refreshRankCache() {
    if (rankCache && Date.now() - rankCacheAt < 30000) {
      return Promise.resolve(rankCache);
    }
    if (rankPromise) return rankPromise;
    rankPromise = Promise.all([
      window.LampsPlatform.getMyLeaderboardRecord("championshipRate"),
      window.LampsPlatform.getMyLeaderboardRecord("championships"),
      window.LampsPlatform.getMyLeaderboardRecord("score"),
    ])
      .then(function (results) {
        rankCache = {
          rate: rankRecord(results[0]),
          championships: rankRecord(results[1]),
          score: rankRecord(results[2]),
        };
        rankCacheAt = Date.now();
        rankPromise = null;
        return rankCache;
      })
      .catch(function () {
        rankPromise = null;
        return null;
      });
    return rankPromise;
  }

  function rateText(entry) {
    if (!entry) return "未上榜";
    var seasons = Number(entry.load.completedSeasons);
    var rate = Number(entry.load.championshipRate);
    if (Number.isSafeInteger(seasons) && seasons >= 0 && seasons < 10) {
      return "—";
    }
    if (Number.isFinite(rate)) return (rate * 100).toFixed(1) + "%";
    return "待同步";
  }

  function championshipsText(entry) {
    if (!entry) return "未上榜";
    var count = Number(entry.load.championships);
    if (!Number.isFinite(count)) count = Number(entry.record.score);
    return Math.max(0, Math.trunc(Number(count) || 0)) + " 冠";
  }

  function scoreText(entry) {
    if (!entry) return "未上榜";
    return Number(entry.record.score || 0).toLocaleString("zh-CN");
  }

  function updateCareerRankPanel() {
    if (!lampsActive() || !hasLeaderboardApi()) return;
    var position = document.querySelector(".career-leaderboard-position");
    if (!position) return;
    var values = position.querySelectorAll("span > b");
    if (values.length < 3) return;
    if (!/暂不可用|未获取到登录态/.test(position.textContent || "")) return;

    refreshRankCache().then(function (cache) {
      if (!cache) return;
      values[0].textContent = rateText(cache.rate);
      values[1].textContent = championshipsText(cache.championships);
      values[2].textContent = scoreText(cache.score);
      var metas = document.querySelectorAll(".career-leaderboard-meta em");
      if (metas[0]) metas[0].textContent = "Lamps 账号最高成绩";
      if (metas[1]) metas[1].textContent = "平台榜单已同步";
    });
  }

  function scheduleRankUpdate() {
    if (!lampsActive() || !hasLeaderboardApi()) return;
    if (rankTimer) return;
    rankTimer = setTimeout(function () {
      rankTimer = null;
      updateCareerRankPanel();
    }, 300);
  }

  function installCareerRankPanel() {
    if (!lampsActive() || !hasLeaderboardApi()) return;
    if (document.body) {
      new MutationObserver(scheduleRankUpdate).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    document.addEventListener("click", scheduleRankUpdate, true);
    scheduleRankUpdate();
  }

  /* ------------------------------------------------------------------
     Save / game progress
     ------------------------------------------------------------------ */

  function openGameDb() {
    return new Promise(function (resolve, reject) {
      var request;
      try {
        request = window.indexedDB.open(DB_NAME);
      } catch (error) {
        reject(error);
        return;
      }
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function () {
        reject(request.error || new Error("无法打开本地存档。"));
      };
    });
  }

  function decompress(save) {
    if (typeof save !== "string") {
      return Promise.reject(new Error("存档格式不正确。"));
    }
    if (save.indexOf("gz:") !== 0) return Promise.resolve(save);
    if (typeof window.DecompressionStream === "undefined") {
      return Promise.reject(new Error("当前环境不支持读取压缩存档。"));
    }
    var binary;
    try {
      binary = window.atob(save.slice(3));
    } catch (_) {
      return Promise.reject(new Error("存档内容损坏。"));
    }
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    var stream = new Blob([bytes])
      .stream()
      .pipeThrough(new window.DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  function summarizeRecord(slot, save) {
    return decompress(save).then(function (json) {
      var envelope = JSON.parse(json);
      var state = envelope.state || {};
      var team =
        state.teams && state.userTeamId != null
          ? state.teams[state.userTeamId]
          : null;
      var history = state.history || {};
      var champions = Array.isArray(history.champions)
        ? history.champions.filter(function (item) {
            return item && item.teamId === state.userTeamId;
          }).length
        : 0;
      var seasons = Array.isArray(history.seasons)
        ? history.seasons.length
        : 0;
      var updatedAt = envelope.updatedAt || 0;
      var updatedMs = new Date(updatedAt).getTime();
      if (!Number.isFinite(updatedMs)) updatedMs = 0;
      return {
        slot: slot,
        save: save,
        saveId: envelope.saveId || "",
        updatedAt: updatedAt,
        updatedMs: updatedMs,
        teamName:
          (team && (team.fullName || team.name)) || "球队",
        seasonId:
          (state.league && state.league.seasonId) || "",
        score:
          state.gmCareer && Number.isFinite(Number(state.gmCareer.dynastyScore))
            ? Number(state.gmCareer.dynastyScore)
            : 0,
        championships: champions,
        completedSeasons: seasons,
      };
    });
  }

  function readCareerRecords() {
    return openGameDb().then(function (db) {
      if (!db.objectStoreNames || !db.objectStoreNames.contains(DB_STORE)) {
        db.close();
        return [];
      }
      return new Promise(function (resolve, reject) {
        var records = [];
        var tx = db.transaction(DB_STORE, "readonly");
        var store = tx.objectStore(DB_STORE);
        var cursor = store.openCursor();
        cursor.onsuccess = function (event) {
          var result = event.target.result;
          if (!result) return;
          var key = text(result.key);
          if (key.indexOf(CAREER_PREFIX) === 0 && /^\d+$/.test(key.slice(CAREER_PREFIX.length))) {
            var slot = Number(key.slice(CAREER_PREFIX.length));
            if (slot >= 1 && slot <= 6) {
              records.push({ slot: slot, save: result.value });
            }
          }
          result.continue();
        };
        cursor.onerror = function () {
          reject(cursor.error || new Error("读取本地存档失败。"));
        };
        tx.oncomplete = function () {
          db.close();
          Promise.all(
            records.map(function (record) {
              return summarizeRecord(record.slot, record.save).catch(function () {
                return null;
              });
            })
          ).then(function (items) {
            resolve(
              items
                .filter(Boolean)
                .sort(function (a, b) {
                  return b.updatedMs - a.updatedMs;
                })
            );
          });
        };
        tx.onerror = function () {
          db.close();
          reject(tx.error || new Error("读取本地存档失败。"));
        };
      });
    });
  }

  function formatTime(value) {
    var date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "时间未知";
    return date.toLocaleString("zh-CN", { hour12: false });
  }

  function closeSettingsDialog() {
    var close = document.querySelector('.settings-dialog button[aria-label="关闭设置"]');
    if (close) {
      close.click();
      return;
    }
    var dialog = document.querySelector(".settings-dialog");
    if (!dialog) return;
    var buttons = dialog.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      var label =
        (buttons[i].getAttribute("aria-label") || "") +
        (buttons[i].textContent || "");
      if (label.indexOf("关闭") >= 0) {
        buttons[i].click();
        return;
      }
    }
  }

  function ensurePanel() {
    if (panel && panel.isConnected) return panel;
    panel = document.createElement("div");
    panel.className = "lamps-cloud-root";
    panel.innerHTML =
      '<div class="lamps-cloud-backdrop"></div>' +
      '<section class="lamps-cloud-card" role="dialog" aria-modal="true" aria-labelledby="lamps-cloud-title">' +
      '<div class="lamps-cloud-head"><span class="lamps-cloud-stamp">LAMPS CLOUD</span><button type="button" class="lamps-cloud-close" aria-label="关闭 Lamps 云存档">×</button></div>' +
      '<div class="lamps-cloud-title" id="lamps-cloud-title">Lamps 云存档</div>' +
      '<p class="lamps-cloud-body">把当前生涯保存到 Lamps 云端，或从云端恢复到本地。云端只保留最近一次保存。</p>' +
      '<select class="lamps-cloud-select" aria-label="选择要保存的本地生涯"></select>' +
      '<p class="lamps-cloud-status"></p>' +
      '<div class="lamps-cloud-actions">' +
      '<button type="button" class="lamps-cloud-primary lamps-cloud-save">保存到 Lamps</button>' +
      '<button type="button" class="lamps-cloud-secondary lamps-cloud-load">从 Lamps 恢复</button>' +
      "</div>" +
      '<div class="lamps-cloud-confirm"><p></p><div class="lamps-cloud-confirm-actions"><button type="button" class="lamps-cloud-primary lamps-cloud-confirm-yes">确认恢复</button><button type="button" class="lamps-cloud-secondary lamps-cloud-confirm-no">取消</button></div></div>' +
      '<p class="lamps-cloud-note">只保存所选槽位的主存档；恢复会覆盖本地同槽位存档。保存失败时请保留本地进度。</p>' +
      "</section>";
    document.body.appendChild(panel);

    panelParts = {
      select: panel.querySelector(".lamps-cloud-select"),
      status: panel.querySelector(".lamps-cloud-status"),
      save: panel.querySelector(".lamps-cloud-save"),
      load: panel.querySelector(".lamps-cloud-load"),
      confirm: panel.querySelector(".lamps-cloud-confirm"),
      confirmText: panel.querySelector(".lamps-cloud-confirm p"),
      confirmYes: panel.querySelector(".lamps-cloud-confirm-yes"),
      confirmNo: panel.querySelector(".lamps-cloud-confirm-no"),
    };

    panel.querySelector(".lamps-cloud-backdrop").addEventListener("click", closePanel);
    panel.querySelector(".lamps-cloud-close").addEventListener("click", closePanel);
    panelParts.save.addEventListener("click", saveCurrentRecord);
    panelParts.load.addEventListener("click", loadCloudRecord);
    panelParts.confirmNo.addEventListener("click", hideConfirm);
    panelParts.confirmYes.addEventListener("click", function () {
      if (!pendingRestore) return;
      restoreRecord(pendingRestore);
    });
    return panel;
  }

  function setBusy(busy) {
    if (!panelParts) return;
    panelParts.save.disabled = !!busy;
    panelParts.load.disabled = !!busy;
    panelParts.select.disabled = !!busy;
    panelParts.confirmYes.disabled = !!busy;
  }

  function hideConfirm() {
    pendingRestore = null;
    if (panelParts) panelParts.confirm.classList.remove("is-on");
  }

  function closePanel() {
    hideConfirm();
    if (panel) panel.classList.remove("is-on");
  }

  function openPanel() {
    ensurePanel();
    panel.classList.add("is-on");
    hideConfirm();
    recordsBySlot = {};
    panelParts.select.replaceChildren();
    setStatus(panelParts.status, "正在读取本地存档…", "");
    setBusy(true);
    readCareerRecords()
      .then(function (records) {
        recordsBySlot = {};
        panelParts.select.replaceChildren();
        records.forEach(function (record) {
          recordsBySlot[String(record.slot)] = record;
          var option = document.createElement("option");
          option.value = String(record.slot);
          option.textContent =
            "槽位 0" +
            record.slot +
            " · " +
            record.teamName +
            " · " +
            (record.seasonId || "赛季未知") +
            " · " +
            formatTime(record.updatedAt);
          panelParts.select.appendChild(option);
        });
        if (!records.length) {
          setStatus(panelParts.status, "本地暂无可保存的生涯。", "error");
          panelParts.save.disabled = true;
          return;
        }
        setStatus(
          panelParts.status,
          "已找到 " + records.length + " 个本地生涯。",
          ""
        );
      })
      .catch(function (error) {
        setStatus(
          panelParts.status,
          (error && error.message) || "读取本地存档失败。",
          "error"
        );
      })
      .finally(function () {
        setBusy(false);
        if (!Object.keys(recordsBySlot).length) panelParts.save.disabled = true;
      });
  }

  function saveCurrentRecord() {
    var slot = panelParts.select.value;
    var record = recordsBySlot[slot];
    if (!record) {
      setStatus(panelParts.status, "请先选择一个本地生涯。", "error");
      return;
    }
    if (!hasProgressApi()) {
      setStatus(panelParts.status, "Lamps 云存档能力暂不可用。", "error");
      return;
    }
    setBusy(true);
    hideConfirm();
    setStatus(panelParts.status, "正在保存到 Lamps 云端…", "");
    var payload = {
      version: 1,
      kind: "bm-career",
      slotId: record.slot,
      saveId: record.saveId,
      updatedAt: record.updatedAt,
      summary: {
        teamName: record.teamName,
        seasonId: record.seasonId,
        score: record.score,
        championships: record.championships,
        completedSeasons: record.completedSeasons,
      },
      save: record.save,
    };
    window.LampsPlatform.saveGameProgress(payload)
      .then(function (result) {
        if (!result || !result.ok || !result.data) {
          throw new Error(
            (result && result.message) || "云端保存失败，请稍后重试。"
          );
        }
        setStatus(
          panelParts.status,
          "已保存到 Lamps 云端 · 槽位 0" +
            record.slot +
            " · " +
            record.teamName +
            " · " +
            (record.seasonId || "赛季未知"),
          "ok"
        );
      })
      .catch(function (error) {
        setStatus(
          panelParts.status,
          (error && error.message) || "云端保存失败，请稍后重试。",
          "error"
        );
      })
      .finally(function () {
        setBusy(false);
      });
  }

  function loadCloudRecord() {
    if (!hasProgressApi()) {
      setStatus(panelParts.status, "Lamps 云存档能力暂不可用。", "error");
      return;
    }
    setBusy(true);
    hideConfirm();
    setStatus(panelParts.status, "正在读取 Lamps 云端存档…", "");
    window.LampsPlatform.getGameProgress()
      .then(function (result) {
        if (!result || !result.ok) {
          throw new Error(
            (result && result.message) || "云端存档读取失败。"
          );
        }
        var saved =
          result.data && result.data.record
            ? result.data.record.gamePayload
            : null;
        if (!saved) {
          setStatus(panelParts.status, "云端暂无存档。", "");
          return;
        }
        if (
          saved.kind !== "bm-career" ||
          !Number.isSafeInteger(saved.slotId) ||
          saved.slotId < 1 ||
          saved.slotId > 6 ||
          typeof saved.save !== "string" ||
          saved.save.indexOf("gz:") !== 0
        ) {
          throw new Error("云端存档格式不正确，无法恢复。");
        }
        pendingRestore = saved;
        panelParts.confirmText.textContent =
          "将覆盖本地槽位 0" +
          saved.slotId +
          (saved.summary && saved.summary.teamName
            ? "（" + saved.summary.teamName + "）"
            : "") +
          " 的存档，确定恢复？";
        panelParts.confirm.classList.add("is-on");
        setStatus(panelParts.status, "请确认恢复操作。", "");
      })
      .catch(function (error) {
        setStatus(
          panelParts.status,
          (error && error.message) || "云端存档读取失败。",
          "error"
        );
      })
      .finally(function () {
        setBusy(false);
      });
  }

  function restoreRecord(saved) {
    setBusy(true);
    setStatus(panelParts.status, "正在恢复到本地槽位…", "");
    openGameDb()
      .then(function (db) {
        if (!db.objectStoreNames || !db.objectStoreNames.contains(DB_STORE)) {
          db.close();
          throw new Error("本地存档库暂不可用。");
        }
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(DB_STORE, "readwrite");
          var store = tx.objectStore(DB_STORE);
          var mainKey = CAREER_PREFIX + saved.slotId;
          var cursor = store.openCursor();
          cursor.onsuccess = function (event) {
            var result = event.target.result;
            if (!result) {
              try {
                store.put(saved.save, mainKey);
              } catch (error) {
                reject(error);
                return;
              }
              return;
            }
            var key = text(result.key);
            if (key.indexOf(mainKey) === 0) {
              result.delete();
            }
            result.continue();
          };
          cursor.onerror = function () {
            reject(cursor.error || new Error("本地存档写入失败。"));
          };
          tx.oncomplete = function () {
            db.close();
            resolve();
          };
          tx.onerror = function () {
            db.close();
            reject(tx.error || new Error("本地存档写入失败。"));
          };
        });
      })
      .then(function () {
        setStatus(
          panelParts.status,
          "恢复完成，正在重新载入游戏…",
          "ok"
        );
        setTimeout(function () {
          window.location.reload();
        }, 800);
      })
      .catch(function (error) {
        setStatus(
          panelParts.status,
          (error && error.message) || "恢复失败，本地存档已保留。",
          "error"
        );
        setBusy(false);
      });
  }

  function injectSettingsEntry() {
    if (!lampsActive() || !hasProgressApi()) return;
    var options = document.querySelector(".settings-dialog .settings-options");
    if (!options) return;
    if (options.querySelector(".lamps-settings-entry")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "lamps-settings-entry";
    button.innerHTML =
      '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M17.5 19a4.5 4.5 0 0 0 .5-8.98A6 6 0 0 0 6.2 8.2 4.5 4.5 0 0 0 7 17h10.5Z"></path>' +
      '<path d="M12 12v6M9.5 15.5 12 18l2.5-2.5"></path>' +
      "</svg>" +
      "<span><b>Lamps 云存档</b><small>保存或恢复平台云存档</small></span>" +
      "<em>›</em>";
    button.addEventListener("click", function () {
      closeSettingsDialog();
      setTimeout(openPanel, 60);
    });
    options.appendChild(button);
  }

  function scheduleSettingsInject() {
    if (!lampsActive()) return;
    if (injectTimer) return;
    injectTimer = setTimeout(function () {
      injectTimer = null;
      injectSettingsEntry();
    }, 120);
  }

  function installSaveUi() {
    if (saveUiInstalled || !lampsActive() || !hasProgressApi()) return;
    saveUiInstalled = true;
    if (document.body) {
      observer = new MutationObserver(scheduleSettingsInject);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    document.addEventListener("click", scheduleSettingsInject, true);
    scheduleSettingsInject();
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */

  function init() {
    if (lampsActive()) {
      installRewardedVideo();
      installLeaderboard();
      installCareerRankPanel();
      installSaveUi();
    }
    window.__LAMPS_INTEGRATION__ = {
      active: lampsActive,
      openSavePanel: function () {
        if (lampsActive()) openPanel();
      },
      readCareerRecords: readCareerRecords,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
