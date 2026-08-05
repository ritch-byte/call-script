/**
 * OA call-script AI relay — Google Apps Script web app.
 *
 * WHY THIS FILE EXISTS
 * The v2 app is static (GitHub Pages), so it cannot hold an API key. It POSTs to
 * this Apps Script instead, which holds the key in Script Properties and forwards
 * the request to Anthropic.
 *
 * WHAT CHANGED
 * The relay that is deployed today forwards only { model, max_tokens, messages }.
 * A `tools` array sent by the client is silently dropped, so the model answers
 * without searching and every "fact" about a prospect is really a guess. The
 * Spiel Builder handles that safely (it marks unprovable claims "hedge it"), but
 * the rep only gets receipts they can actually defend once web search works.
 *
 * This version forwards `tools` and returns the full content array, so
 * web_search_tool_result blocks reach the browser and the app can mark those
 * receipts as seen.
 *
 * TO DEPLOY
 * 1. script.google.com  ->  open the existing relay project (do not create a new
 *    one, or the URL in src/lib/ai.ts stops matching).
 * 2. Replace Code.gs with this file.
 * 3. Project Settings -> Script Properties: confirm ANTHROPIC_API_KEY is set.
 * 4. Deploy -> Manage deployments -> edit the active deployment -> New version
 *    -> Deploy. Keeping the same deployment preserves the /exec URL.
 * 5. Verify: the Spiel Builder should start showing green "seen" chips with
 *    source URLs instead of amber "hedge it" chips.
 *
 * Content-Type on the client is text/plain so the browser treats it as a
 * CORS-simple request and skips the preflight Apps Script cannot answer.
 */

var ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
var ANTHROPIC_VERSION = '2023-06-01';

// Models the floor tools are allowed to spend on.
var ALLOWED_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-6',
  'claude-opus-5'
];

var DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
var MAX_TOKENS_CEILING = 4000;

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);

    if (!req.messages || !req.messages.length) {
      return json({ error: { message: 'messages is required' } });
    }

    var model = ALLOWED_MODELS.indexOf(req.model) !== -1 ? req.model : DEFAULT_MODEL;

    var payload = {
      model: model,
      max_tokens: Math.min(req.max_tokens || 1000, MAX_TOKENS_CEILING),
      messages: req.messages
    };

    // Pass tools through so server-side web search actually runs. Anthropic
    // executes these on its own infrastructure; nothing runs here.
    if (req.tools && req.tools.length) payload.tools = req.tools;
    if (req.system) payload.system = req.system;

    var key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
    if (!key) return json({ error: { message: 'relay is missing ANTHROPIC_API_KEY' } });

    var res = UrlFetchApp.fetch(ANTHROPIC_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var code = res.getResponseCode();
    var body = res.getContentText();

    // Pass the upstream body straight back, including the full content array,
    // so the client can see server_tool_use / web_search_tool_result blocks.
    if (code >= 200 && code < 300) {
      return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
    }

    // Surface upstream errors in the shape the client already checks for.
    var message = 'Anthropic returned ' + code;
    try {
      var parsed = JSON.parse(body);
      if (parsed && parsed.error && parsed.error.message) message = parsed.error.message;
    } catch (ignored) {}
    return json({ error: { message: message } });

  } catch (err) {
    return json({ error: { message: String(err) } });
  }
}

function doGet() {
  return json({ ok: true, note: 'OA call-script AI relay. POST { model, max_tokens, messages, tools }.' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
