/**
 * 游戏榜单的游戏入口。只暴露 submitLeaderboardScore、getLeaderboard、getMyLeaderboardRecord、getLeaderboardInfo。
 * 底层走 window.__HOORAH_LAMPS_BRIDGE__.callHost。游戏代码只调 window.LampsPlatform。
 */
(function (global) {
  "use strict";

  function bridge() {
    return global.__HOORAH_LAMPS_BRIDGE__;
  }

  function normalizeHostResult(msg) {
    if (!msg || msg.ok === false) {
      return {
        ok: false,
        message: (msg && msg.message) || "调用失败",
        data: null,
      };
    }
    return {
      ok: true,
      data: msg.data == null ? null : msg.data,
    };
  }

  function hasLampsSdkUa() {
    try {
      return (
        String((global.navigator && global.navigator.userAgent) || "").indexOf(
          "LampsSDK"
        ) !== -1
      );
    } catch (e) {
      return false;
    }
  }

  function callHost(method, payload) {
    var b = bridge();
    if (!b || typeof b.callHost !== "function") {
      return Promise.resolve({
        ok: false,
        message: "榜单能力暂不可用",
        data: null,
      });
    }
    return b.callHost(method, payload || {}).then(normalizeHostResult).catch(function (err) {
      return {
        ok: false,
        message: err && err.message ? err.message : String(err),
        data: null,
      };
    });
  }

  function toLeaderboardScore(score) {
    if (typeof score === "number" && isFinite(score)) return Math.trunc(score);
    if (typeof score === "string" && String(score).trim()) {
      var parsed = Number(score);
      if (isFinite(parsed)) return Math.trunc(parsed);
    }
    return null;
  }

  function toGameRankType(value) {
    if (typeof value !== "string") return "";
    return String(value).trim();
  }

  function withGameRankType(payload, gameRankType) {
    var type = toGameRankType(gameRankType);
    if (type) payload.gameRankType = type;
    return payload;
  }

  function toDataLoad(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value;
  }

  function withDataLoad(payload, dataLoad) {
    var data = toDataLoad(dataLoad);
    if (data) payload.dataLoad = data;
    return payload;
  }

  function submitLeaderboardScore(score, gameRankType, dataLoad) {
    if (!hasLampsSdkUa()) {
      return Promise.resolve({
        ok: false,
        message: "排行榜暂不可用",
        data: null,
      });
    }
    var normalized = toLeaderboardScore(score);
    if (normalized == null) {
      return Promise.resolve({
        ok: false,
        message: "得分必须是整数",
        data: null,
      });
    }
    return callHost(
      "submitLeaderboardScore",
      withDataLoad(withGameRankType({ score: normalized }, gameRankType), dataLoad)
    );
  }

  function getLeaderboard(gameRankType) {
    if (!hasLampsSdkUa()) {
      return Promise.resolve({
        ok: true,
        data: { list: [] },
      });
    }
    return callHost("getLeaderboard", withGameRankType({}, gameRankType));
  }

  function getMyLeaderboardRecord(gameRankType) {
    if (!hasLampsSdkUa()) {
      return Promise.resolve({
        ok: true,
        data: { record: null },
      });
    }
    return callHost(
      "getMyLeaderboardRecord",
      withGameRankType({}, gameRankType)
    );
  }

  function getLeaderboardInfo(gameRankType) {
    if (!hasLampsSdkUa()) {
      return Promise.resolve({
        ok: true,
        data: { totalCount: 0 },
      });
    }
    return callHost("getLeaderboardInfo", withGameRankType({}, gameRankType));
  }

  var api = global.LampsPlatform || {};
  api.submitLeaderboardScore = submitLeaderboardScore;
  api.getLeaderboard = getLeaderboard;
  api.getMyLeaderboardRecord = getMyLeaderboardRecord;
  api.getLeaderboardInfo = getLeaderboardInfo;
  if (!api.bridge) api.bridge = bridge;
  global.LampsPlatform = api;
})(typeof window !== "undefined" ? window : globalThis);
