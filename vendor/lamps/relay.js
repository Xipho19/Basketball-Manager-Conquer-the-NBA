/* Lamps transport relay for the game shell.
 *
 * The game UI runs inside __ai_app.html, while the actual Lamps host is the
 * parent of this top-level index.html. This relay forwards capability calls
 * from the game iframe to the shared Lamps bridge, then returns the host
 * response to the calling iframe.
 */
(function (global) {
  "use strict";

  var CHANNEL = "hoorah-minigame-sandbox";
  var RELAY_TIMEOUT_MS = 180000;

  function isGameFrame(source) {
    var frame;
    try {
      frame = document.querySelector(
        'iframe[data-src="./__ai_app.html"], iframe[src*="__ai_app.html"]'
      );
    } catch (_) {
      return false;
    }
    return !!frame && frame.contentWindow === source;
  }

  function sendResult(source, origin, requestId, result) {
    if (origin !== global.location.origin) return;
    try {
      source.postMessage(
        {
          channel: CHANNEL,
          type: "call-result",
          requestId: requestId,
          ok: !!(result && result.ok !== false),
          data: result ? result.data : null,
          message: result ? result.message : "",
        },
        origin
      );
    } catch (_) {}
  }

  global.addEventListener(
    "message",
    function (event) {
      var data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.channel !== CHANNEL || data.type !== "call") return;
      if (event.origin !== global.location.origin) return;
      if (!isGameFrame(event.source)) return;

      var bridge = global.__HOORAH_LAMPS_BRIDGE__;
      if (!bridge || typeof bridge.callHost !== "function") {
        sendResult(event.source, event.origin, data.requestId, {
          ok: false,
          message: "Lamps 连接暂不可用",
        });
        return;
      }

      bridge
        .callHost(data.method, data.payload || {}, RELAY_TIMEOUT_MS)
        .then(function (result) {
          sendResult(event.source, event.origin, data.requestId, result || {});
        })
        .catch(function (error) {
          sendResult(event.source, event.origin, data.requestId, {
            ok: false,
            message:
              (error && error.message) || "Lamps 请求超时，请稍后重试",
          });
        });
    },
    true
  );
})(window);
