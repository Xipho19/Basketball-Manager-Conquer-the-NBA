/**
 * 激励视频的游戏入口。只暴露 showRewardedVideo。
 * 向父页面申请播放。游戏代码只调 window.LampsGame。
 */
(function (global) {
  "use strict";

  var AD_TIMEOUT_MS = 180000;

  function bridge() {
    return global.__HOORAH_LAMPS_BRIDGE__;
  }

  function normalizeHostResult(msg) {
    var data = msg && msg.data && typeof msg.data === "object" ? msg.data : null;
    if (!msg || msg.ok === false) {
      return {
        ok: false,
        code: (data && data.code) || undefined,
        message: (msg && msg.message) || (data && data.message) || "激励视频暂不可用",
        data: null,
      };
    }
    return {
      ok: true,
      data: data,
    };
  }

  function callHost(method, payload, timeoutMs) {
    var b = bridge();
    if (!b || typeof b.callHost !== "function") {
      return Promise.resolve({
        ok: false,
        code: "UNAVAILABLE",
        message: "激励视频暂不可用",
        data: null,
      });
    }
    return b
      .callHost(method, payload || {}, timeoutMs)
      .then(normalizeHostResult)
      .catch(function (err) {
        return {
          ok: false,
          code: "UNAVAILABLE",
          message: err && err.message ? err.message : String(err),
          data: null,
        };
      });
  }

  function pickOptions(options) {
    if (!options || typeof options !== "object") return {};
    var payload = {};
    if (typeof options.source === "string") payload.source = options.source;
    return payload;
  }

  function showRewardedVideo(options) {
    return callHost("showRewardedVideo", pickOptions(options), AD_TIMEOUT_MS);
  }

  var api = global.LampsGame || {};
  api.showRewardedVideo = showRewardedVideo;
  if (!api.bridge) api.bridge = bridge;
  global.LampsGame = api;
})(typeof window !== "undefined" ? window : globalThis);
