/**
 * OA Spiel Builder - API proxy
 *
 * Holds the Anthropic key server side and pins the model, so the cost per
 * spiel is fixed no matter what the browser sends.
 *
 * Setup:
 *  1. Project Settings > Script properties > add ANTHROPIC_API_KEY
 *  2. Deploy > New deployment > Web app
 *       Execute as:  Me
 *       Access:      Anyone within Outsource Accelerator
 *  3. Copy the /exec URL into PROXY_URL in spiel-builder.html
 *
 * NOT DEPLOYED YET. Kept here under version control so it does not get lost, and
 * so the caps below can be read next to the prompt they apply to. The v2 Spiel
 * Builder still calls the app's shared relay (src/lib/ai.ts) and names the model
 * in the component. Deploy this, then point the component at the /exec URL, and
 * the model stops being something the browser can change.
 *
 * MAX_PROMPT_CHARS IS 12000, NOT THE 9000 IT SHIPPED WITH. The v2 prompt measured
 * 8309 characters for the brief's own test lead before beat 3 gained the
 * offshorability test, and that addition costs about 700 more. At 9000 a long CRM
 * row would have crossed the line, and past the line this proxy answers "Bad
 * request.", which reaches the rep as "That did not come back clean. Run it again."
 * Running it again cannot help, because the prompt is the same length every time.
 * The ceiling is here to stop a browser sending an arbitrary prompt on our key, and
 * 12000 still does that with room for the prompt to grow.
 */

var MODEL = 'claude-haiku-4-5-20251001'; // ~$0.0036 per spiel
var MAX_TOKENS = 800;                    // four short beats need ~350
var MAX_PROMPT_CHARS = 12000;            // refuse anything not our spec

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var prompt = body.prompt || '';

    // a browser should never be able to send an arbitrary prompt on our key
    if (!prompt || prompt.length > MAX_PROMPT_CHARS) {
      return json({ error: { message: 'Bad request.' } });
    }
    if (prompt.indexOf('Outsource Accelerator') === -1) {
      return json({ error: { message: 'Bad request.' } });
    }

    var key = PropertiesService
      .getScriptProperties()
      .getProperty('ANTHROPIC_API_KEY');
    if (!key) return json({ error: { message: 'Key not set.' } });

    var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }]
      }),
      muteHttpExceptions: true
    });

    log_(res.getResponseCode());
    return ContentService
      .createTextOutput(res.getContentText())
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return json({ error: { message: String(err) } });
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Rough daily counter, so you can see volume without opening the console. */
function log_(code) {
  var p = PropertiesService.getScriptProperties();
  var day = Utilities.formatDate(new Date(), 'Asia/Manila', 'yyyy-MM-dd');
  var k = 'calls_' + day;
  p.setProperty(k, String(Number(p.getProperty(k) || 0) + 1));
}

/** Run manually to see today's call count and rough spend. */
function todaysUsage() {
  var day = Utilities.formatDate(new Date(), 'Asia/Manila', 'yyyy-MM-dd');
  var n = Number(
    PropertiesService.getScriptProperties().getProperty('calls_' + day) || 0
  );
  Logger.log(day + ': ' + n + ' spiels, about $' + (n * 0.0036).toFixed(2));
}
