const IMAGE_MODELS = [
  "gemini-3.1-flash-image-preview", "gemini-3-pro-image-preview", "gemini-nano-banana-2.1",
  "gpt-image-2", "gpt-image-2.5", "gpt-image-2.5-flare", "gpt-image-2.5-sunburst",
  "seedream-5.0-pro", "grok-imagine-image-2.0",
  // Uselg 当前公开的 Midjourney/Niji 图像模型（按请求计费）。
  "midjourney-full", "midjourney-v5-full", "midjourney-v5.1-full", "midjourney-v5.2-full",
  "midjourney-v6-full", "midjourney-v6.1-full", "midjourney-v7-full", "midjourney-v8-full",
  "midjourney-v8.1-full", "midjourney-v8.2-full", "niji-v5-full", "niji-v6-full", "niji-v7-full",
];

const VIDEO_MODELS = [
  "wan3.0-image", "wan3.0-image-prime", "wan3.0-video", "wan3.0-video-prime",
  "sd2.0-按秒-933-线路1", "sd2.0-满血-903-线路1", "sd2.0-fast-933-线路1",
  "sd2.0-满血-903-线路3", "sd2.0-903-线路4", "sd2.0-按秒-933-线路2",
  "sd2.0-fast-933-线路3", "sd2.0-官转903-线路1",
  "sd2.5-按秒满血301010-线路3", "sd2.5-按秒满血301010-线路4", "sd2.5-官转50-线路1",
  "全参MinimaxH3", "官方h3-2k", "官方h3-1080p", "官方h3-720p",
  "minimax_h3-1080p", "minimax_h3-768p", "rh-minimaxh3-overseas", "rh-minimaxh3-pro-overseas",
  "grok-imagine-video-1.5（按次）", "grok-imagine-video-1.5-fast", "grok-imagine-video-1.5-lite",
];

const MUSIC_MODELS = ["Lyria-3.5音频音乐", "Lyria-3pro音频音乐", "suno"];
const MODELS = IMAGE_MODELS.concat(VIDEO_MODELS, MUSIC_MODELS);
const GEMINI_IMAGES = ["gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview", "gemini-nano-banana-2.1"];
const MIDJOURNEY_IMAGES = IMAGE_MODELS.filter((model) => /^midjourney-|^niji-|^Midjourney /.test(model));
const FIXED_IMAGE_MODELS = MIDJOURNEY_IMAGES;
const FIXED_VIDEOS = [
  "sd2.0-满血-903-线路1", "sd2.0-fast-933-线路1", "sd2.0-满血-903-线路3", "sd2.0-903-线路4",
  "sd2.0-fast-933-线路3", "sd2.0-官转903-线路1", "全参MinimaxH3", "rh-minimaxh3-overseas",
  "rh-minimaxh3-pro-overseas", "grok-imagine-video-1.5（按次）", "grok-imagine-video-1.5-fast",
  "grok-imagine-video-1.5-lite",
];
const REFERENCE_VIDEO_DURATION_BILLING = ["wan3.0-video", "wan3.0-video-prime"];

const IMAGE_SCHEMA = {
  image_count: { type: "number", unit: "count", unitLabel: { en: "image", zh: "张" }, description: { en: "Image generation unit price", zh: "图片生成单价" } },
};
const IMAGE_FIXED_SCHEMA = {
  clips: { type: "number", unit: "count", unitLabel: { en: "request", zh: "次" }, description: { en: "Image request unit price", zh: "图片请求单价" } },
};
const VIDEO_SECOND_SCHEMA = {
  seconds: { type: "number", unit: "second", description: { en: "Video duration unit price", zh: "视频时长单价" } },
};
const VIDEO_FIXED_SCHEMA = {
  clips: { type: "number", unit: "count", unitLabel: { en: "request", zh: "次" }, description: { en: "Video request unit price", zh: "视频请求单价" } },
};
const MUSIC_SCHEMA = {
  clips: { type: "number", unit: "count", unitLabel: { en: "request", zh: "次" }, description: { en: "Music request unit price", zh: "音乐请求单价" } },
};

export const meta = {
  apiVersion: 1,
  key: "uselg-interface",
  name: "uselg接口",
  icon: "text:U",
  description: {
    en: "FluxPort / uselg image, video and music adapter",
    zh: "uselg 图片、视频与音乐任务接口适配器",
  },
  version: "1.0.0",
  author: { name: "TokenUFC" },
  website: "https://uselg.top/docs",
  baseUrl: "https://api.ai-media.vip",
  allowedHosts: ["api.ai-media.vip", "api.uselg.top"],
  models: MODELS,
  fetchMode: "per_task",
  auth: "api_key",
  upstreams: ["vendor"],
  usageSchema: IMAGE_SCHEMA,
  usageProfiles: [
    { models: IMAGE_MODELS.filter((model) => !FIXED_IMAGE_MODELS.includes(model)), schema: IMAGE_SCHEMA, examples: [{ label: "1 张图片", facts: { image_count: 1 } }] },
    { models: FIXED_IMAGE_MODELS, schema: IMAGE_FIXED_SCHEMA, examples: [{ label: "1 次请求", facts: { clips: 1 } }] },
    { models: VIDEO_MODELS.filter((model) => !FIXED_VIDEOS.includes(model)), schema: VIDEO_SECOND_SCHEMA, examples: [{ label: "5 秒视频", facts: { seconds: 5 } }] },
    { models: FIXED_VIDEOS, schema: VIDEO_FIXED_SCHEMA, examples: [{ label: "1 条视频", facts: { clips: 1 } }] },
    { models: MUSIC_MODELS, schema: MUSIC_SCHEMA, examples: [{ label: "1 次音乐请求", facts: { clips: 1 } }] },
  ],
  routes: [],
  protocols: [
    { name: "openai_image", models: IMAGE_MODELS },
    { name: "openai_video", models: VIDEO_MODELS },
    { name: "openai_responses", models: MODELS, supports: ["stream", "sync", "background"] },
  ],
};

function text(value) { return String(value === undefined || value === null ? "" : value).trim(); }
function plain(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : null; }
function isGemini(model) { return GEMINI_IMAGES.includes(model); }
function endpoint(ctx, model) {
  if (MUSIC_MODELS.includes(model)) return "https://api.uselg.top";
  if (MIDJOURNEY_IMAGES.includes(model)) return "https://api.uselg.top";
  return (text(ctx.baseUrl) || "https://api.ai-media.vip").replace(/\/v1\/?$/i, "");
}
function authHeaders(ctx, extra) {
  return Object.assign({ Authorization: "Bearer " + ctx.apiKey }, extra || {});
}
function geminiHeaders(ctx, extra) {
  // Uselg's native Gemini endpoint documents x-goog-api-key.  Do not send a
  // second Bearer credential: some Gemini-compatible relays reject it.
  return Object.assign({ "x-goog-api-key": ctx.apiKey }, extra || {});
}
function number(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function imageCount(body) {
  if (!body || typeof body !== "object") return 1;
  // Count every emitted image representation, including Gemini candidates.inlineData.
  // imageEntries() also handles vendor `data`, `assets`, and fileData shapes and
  // de-duplicates asset URLs that were already present in `data`.
  return imageEntries(body).length;
}
function imageAssetNeedsAuth(url) {
  return url.startsWith("/") || /^https:\/\/(?:api\.uselg\.top|api\.ai-media\.vip)(?:\/|$)/i.test(url);
}
function isFixedImage(model) { return FIXED_IMAGE_MODELS.includes(model); }
function imageEntries(body) {
  const entries = [], urls = new Set(), inlineData = new Set(), seen = new Set();
  const addUrl = (value, mimeType, authenticated) => {
    const url = text(value);
    if (!url || urls.has(url)) return;
    urls.add(url);
    entries.push({ url: url, mimeType: mimeType || "image/png", type: "image", authenticated: authenticated === undefined ? imageAssetNeedsAuth(url) : authenticated });
  };
  const addInline = (value, mimeType) => {
    const data = text(value);
    if (!data || inlineData.has(data)) return;
    inlineData.add(data);
    entries.push({ data: data, mimeType: mimeType || "image/png", type: "image" });
  };
  const visit = (value, key) => {
    if (!value || typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);
    if (text(value.signed_url)) addUrl(value.signed_url, text(value.mime_type || value.mimeType) || "image/png", false);
    else if (text(value.download_url)) addUrl(value.download_url, text(value.mime_type || value.mimeType) || "image/png");
    else if (text(value.url) && (key === "data" || key === "assets" || key === "output" || key === "result" || key === "images" || key === "fileData")) addUrl(value.url, text(value.mime_type || value.mimeType) || "image/png");
    if (text(value.b64_json)) addInline(value.b64_json, text(value.mime_type || value.mimeType) || "image/png");
    const inline = value.inlineData || value.inline_data;
    if (inline && text(inline.data)) addInline(inline.data, text(inline.mimeType || inline.mime_type) || "image/png");
    const file = value.fileData || value.file_data;
    if (file && text(file.fileUri || file.file_uri)) addUrl(file.fileUri || file.file_uri, text(file.mimeType || file.mime_type) || "image/png");
    for (const childKey of ["data", "assets", "candidates", "result", "output", "response", "task", "content", "parts", "images"]) {
      const child = value[childKey];
      if (Array.isArray(child)) child.forEach((item) => visit(item, childKey));
      else if (child && typeof child === "object") visit(child, childKey);
    }
  };
  visit(body, "root");
  return entries;
}
function imageTaskId(body) { return text(body && (body.id || body.task_id || body.taskId || body.request_id)); }
function taskStatus(body) {
  const value = text(body && (body.status || body.state)).toLowerCase();
  if (body && body.video_available === false && ["completed", "success", "succeeded", "done"].includes(value)) return "IN_PROGRESS";
  if (body && ["saving", "pending", "processing", "generating", "failed"].includes(text(body.asset_state).toLowerCase()) && ["completed", "success", "succeeded", "done"].includes(value)) return "IN_PROGRESS";
  if (["queued", "pending", "submitted"].includes(value)) return "QUEUED";
  if (["dispatching", "uncertain", "pending_confirmation", "client_disconnected", "paused"].includes(value)) return "IN_PROGRESS";
  if (["processing", "in_progress", "running"].includes(value)) return "IN_PROGRESS";
  if (["completed", "success", "succeeded", "done"].includes(value)) return "SUCCESS";
  if (["failed", "failure", "cancelled", "canceled"].includes(value)) return "FAILURE";
  return "UNKNOWN";
}
function taskReason(body) {
  const error = plain(body && body.error);
  return text((error && (error.message || error.code)) || (body && (body.fail_reason || body.message)) || "task failed");
}
function requestPrompt(req) {
  if (text(req.prompt)) return text(req.prompt);
  const input = req.input;
  if (typeof input === "string") return text(input);
  if (Array.isArray(input)) {
    return input.map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      const content = Array.isArray(item.content) ? item.content : [item.content === undefined ? item : item.content];
      return content.map((part) => typeof part === "string" ? part : part && (part.text || part.input_text) || "").join(" ");
    }).join("\n").trim();
  }
  return "";
}
function responsesInput(req) {
  const texts = [], images = [];
  const input = req && req.input;
  if (typeof input === "string") texts.push(input);
  else if (Array.isArray(input)) for (const item of input) {
    if (typeof item === "string") { texts.push(item); continue; }
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const content = item.content === undefined ? [item] : Array.isArray(item.content) ? item.content : [item.content];
    for (const part of content) {
      if (typeof part === "string") { texts.push(part); continue; }
      if (!part || typeof part !== "object" || Array.isArray(part)) continue;
      if (["input_text", "text"].includes(part.type) && typeof part.text === "string") texts.push(part.text);
      if (["input_image", "image_url"].includes(part.type)) {
        let image = part.image_url;
        if (image && typeof image === "object" && image.url !== undefined) image = image.url;
        if (image && typeof image === "object" && image.__fileRef) images.push(image);
        else if (typeof image === "string" && image.trim()) images.push(image.trim());
      }
    }
  }
  return { prompt: texts.map(text).filter(Boolean).join("\n"), images: images };
}
function responseInput(req) { return responsesInput(req).prompt || requestPrompt(req) || ""; }
function dataUrl(value, mime) { return "data:" + (mime || "image/png") + ";base64," + text(value); }
function imageRefs(req) {
  const values = [];
  const source = Array.isArray(req.images) ? req.images : [];
  for (const item of source) {
    if (typeof item === "string") values.push({ image_url: item });
    else if (plain(item)) values.push(item);
  }
  return values;
}
function geminiParts(req) {
  const parts = [];
  const prompt = requestPrompt(req);
  if (prompt) parts.push({ text: prompt });
  for (const item of imageRefs(req)) {
    const raw = item.image_url || item.url || item.data;
    if (raw && typeof raw === "object" && !Array.isArray(raw) && raw.__fileRef) {
      parts.push({ inlineData: { mimeType: text(raw.mimeType || item.mimeType) || "application/octet-stream", data: raw } });
      continue;
    }
    const value = text(raw);
    if (!value) continue;
    if (value.startsWith("data:")) {
      const match = value.match(/^data:([^;]+);base64,(.+)$/i);
      if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    } else {
      parts.push({ fileData: { mimeType: text(item.mimeType) || "image/png", fileUri: value } });
    }
  }
  return parts;
}
function musicBody(model, req) {
  return {
    model: model,
    messages: [{ role: "user", content: responseInput(req) }],
    stream: false,
  };
}
function completionLinks(body) {
  const links = [];
  const add = (value) => { const v = text(value); if (/^https?:\/\//i.test(v) && !links.includes(v)) links.push(v); };
  for (const item of Array.isArray(body && body.data) ? body.data : []) if (plain(item)) add(item.signed_url || item.url || item.download_url || item.audio_url);
  const choices = Array.isArray(body && body.choices) ? body.choices : [];
  for (const choice of choices) {
    const content = choice && choice.message && choice.message.content;
    if (typeof content === "string") {
      const found = content.match(/https?:\/\/[^\s<>"')\]]+/g) || [];
      found.forEach(add);
    }
  }
  return links;
}

function multipartVideoRequest(ctx, req) {
  const files = Array.isArray(ctx.files) ? ctx.files : [];
  if (!files.length) return null;
  const fields = [];
  const fileFields = new Set(["image", "input_reference", "reference_images", "start_frame", "end_frame"]);
  for (const file of files) {
    if (!fileFields.has(text(file.field))) throw new Error("unsupported video file field: " + text(file.field));
    fields.push({ name: text(file.field), fileRef: text(file.ref), filename: text(file.filename) || "upload" });
  }
  for (const key of Object.keys(req)) {
    if (key === "model" || key === "prompt" || (key === "image" && files.some((file) => text(file.field) === "image")) || (key === "images" && files.some((file) => text(file.field) === "image"))) continue;
    const value = req[key];
    if (value === undefined || value === null) continue;
    if (["input_reference", "start_frame", "end_frame"].includes(key) && typeof value === "string") fields.push({ name: key, value: value });
    else if (key === "reference_images" && Array.isArray(value)) for (const item of value) if (typeof item === "string") fields.push({ name: key, value: item });
    else if (!["input_reference", "reference_images", "start_frame", "end_frame"].includes(key)) fields.push({ name: key, value: typeof value === "string" ? value : JSON.stringify(value) });
  }
  fields.unshift({ name: "prompt", value: requestPrompt(req) }, { name: "model", value: text(ctx.upstreamModel || ctx.model) });
  return fields;
}

export function buildSubmitRequest(ctx) {
  const model = text(ctx.upstreamModel || ctx.model);
  const req = plain(ctx.requestBody) || {};
  if (MUSIC_MODELS.includes(model)) {
    const prompt = responseInput(req);
    if (!prompt) throw new Error("music prompt is required");
    return { url: endpoint(ctx, model) + "/v1/chat/completions", method: "POST", headers: authHeaders(ctx, { "Content-Type": "application/json" }), body: musicBody(model, req), action: "music" };
  }
  if (isGemini(model)) {
    const parts = geminiParts(req);
    if (!parts.length) throw new Error("image prompt is required");
    const body = { contents: [{ role: "user", parts: parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } };
    if (req.size || req.aspect_ratio) body.generationConfig.imageConfig = Object.assign({}, req.size ? { imageSize: req.size } : {}, req.aspect_ratio ? { aspectRatio: req.aspect_ratio } : {});
    return { url: endpoint(ctx, model) + "/v1beta/models/" + encodeURIComponent(model) + ":generateContent", method: "POST", headers: geminiHeaders(ctx, { "Content-Type": "application/json" }), body: body, action: "image" };
  }
  if (IMAGE_MODELS.includes(model)) {
    const body = Object.assign({}, req, { model: model });
    return { url: endpoint(ctx, model) + "/v1/images/" + (ctx.operation === "edit" ? "edits" : "generations"), method: "POST", headers: authHeaders(ctx, { "Content-Type": "application/json", "Idempotency-Key": text(ctx.publicTaskId) || "uselg-" + model }), body: body, action: "image" };
  }
  if (VIDEO_MODELS.includes(model)) {
    const body = Object.assign({}, req, { model: model });
    const parts = multipartVideoRequest(ctx, req);
    const headers = authHeaders(ctx, { "Idempotency-Key": text(ctx.publicTaskId) || "uselg-" + model });
    if (parts) return { url: endpoint(ctx, model) + "/v1/videos", method: "POST", headers: headers, bodyType: "multipart", parts: parts, action: "video" };
    return { url: endpoint(ctx, model) + "/v1/videos", method: "POST", headers: Object.assign(headers, { "Content-Type": "application/json" }), body: body, action: "video" };
  }
  throw new Error("model is not supported by uselg-interface");
}

export function parseSubmitResponse(ctx, resp) {
  const body = resp.body || {};
  const model = text(ctx.upstreamModel || ctx.model);
  if (MUSIC_MODELS.includes(model)) {
    if (body.error) throw new Error(text(body.error.message || body.error.code) || "music request failed");
    if (!completionLinks(body).length) throw new Error("music response has no audio URL");
    return { taskId: text(body.id) || text(ctx.publicTaskId) || "uselg-music-result", taskData: body, immediate: { status: "SUCCESS", progress: "100%" } };
  }
  const entries = imageEntries(body);
  const taskId = imageTaskId(body);
  if (entries.length) return { taskId: taskId || text(ctx.publicTaskId) || "uselg-image-result", taskData: body, immediate: { status: "SUCCESS", progress: "100%" } };
  if (taskId) {
    const state = usageState(model, plain(ctx.requestBody) || {});
    return state ? { taskId: taskId, taskData: body, state: state } : { taskId: taskId, taskData: body };
  }
  throw new Error("upstream response has no image or task id");
}

export function extractUsage(ctx) {
  const model = text(ctx.upstreamModel || ctx.model);
  const body = plain(ctx.requestBody) || {};
  if (MUSIC_MODELS.includes(model)) return { clips: 1 };
  if (IMAGE_MODELS.includes(model)) {
    if (isFixedImage(model)) return { clips: 1 };
    return { image_count: number(body.n, 1) };
  }
  if (FIXED_VIDEOS.includes(model)) return { clips: 1 };
  return { seconds: Math.max(1, number(body.seconds === undefined ? body.duration : body.seconds, 5) + referenceVideoSeconds(model, body)) };
}
export function extractUsageOnComplete(task, taskResult, body) {
  const model = text((task && task.properties && task.properties.upstream_model_name) || (task && task.properties && task.properties.origin_model_name));
  if (MUSIC_MODELS.includes(model)) return { clips: 1 };
  if (IMAGE_MODELS.includes(model)) {
    if (isFixedImage(model)) return { clips: 1 };
    const count = imageCount(body || {});
    const state = plain(task && task.state) || {};
    return { image_count: count > 0 ? count : Math.max(1, number(state.image_count, 1)) };
  }
  if (FIXED_VIDEOS.includes(model)) return { clips: 1 };
  const value = number(body && (body.seconds || body.duration), 0);
  if (value <= 0) return {};
  const state = plain(task && task.state) || {};
  return { seconds: value + Math.max(0, number(state.reference_video_seconds, 0)) };
}

function referenceVideoSeconds(model, body) {
  if (!REFERENCE_VIDEO_DURATION_BILLING.includes(model)) return 0;
  const videos = Array.isArray(body && body.reference_videos) ? body.reference_videos : [];
  return videos.reduce((sum, item) => {
    const duration = plain(item) ? number(item.duration === undefined ? item.seconds : item.duration, 0) : 0;
    return sum + (duration > 0 ? duration : 0);
  }, 0);
}
function usageState(model, body) {
  const state = {};
  const seconds = referenceVideoSeconds(model, body);
  if (seconds > 0) state.reference_video_seconds = seconds;
  if (IMAGE_MODELS.includes(model)) state.image_count = Math.max(1, number(body && body.n, 1));
  return Object.keys(state).length ? state : undefined;
}

export function buildQueryRequest(ctx) {
  const model = text(ctx.upstreamModel || ctx.model);
  if (MUSIC_MODELS.includes(model)) throw new Error("music is synchronous and has no query endpoint");
  if (IMAGE_MODELS.includes(model)) {
    const data = plain(ctx.data) || {};
    const statusUrl = text(data.status_url || data.poll_url);
    const base = endpoint(ctx, model);
    if (!ctx.data) return { url: base + "/v1/images/tasks/" + encodeURIComponent(ctx.taskId), method: "GET", headers: authHeaders(ctx) };
    if (statusUrl.startsWith(base + "/")) return { url: statusUrl, method: "GET", headers: authHeaders(ctx) };
    if (statusUrl.startsWith("/")) return { url: base + statusUrl, method: "GET", headers: authHeaders(ctx) };
    if (/^https:\/\/(?:api\.uselg\.top|api\.ai-media\.vip)(?:\/|$)/i.test(statusUrl)) return { url: statusUrl, method: "GET", headers: authHeaders(ctx) };
    return { url: base + "/v1/images/tasks/" + encodeURIComponent(ctx.taskId) + "?view=summary", method: "GET", headers: authHeaders(ctx) };
  }
  return { url: endpoint(ctx, model) + "/v1/videos/" + encodeURIComponent(ctx.taskId), method: "GET", headers: authHeaders(ctx) };
}
export function parseTaskResult(ctx, body) {
  const status = taskStatus(body);
  const result = { status: status };
  if (status === "FAILURE") result.reason = taskReason(body);
  const progress = number(body && body.progress, NaN);
  if (Number.isFinite(progress)) result.progress = progress + "%";
  return result;
}
export function listArtifacts(task) {
  if (!task || task.status !== "SUCCESS") return [];
  const body = task.data || {};
  const model = text(task.properties && (task.properties.upstream_model_name || task.properties.origin_model_name));
  if (MUSIC_MODELS.includes(model)) return completionLinks(body).map((url, i) => ({ key: "audio-" + (i + 1), type: "audio", mimeType: "audio/mpeg" }));
  const entries = imageEntries(body);
  if (IMAGE_MODELS.includes(model)) return entries.filter((entry) => entry.url).map((entry, i) => ({ key: "image-" + (i + 1), type: "image", mimeType: entry.mimeType || "image/png" }));
  return [{ key: "video", type: "video" }];
}
export function buildContentRequest(ctx) {
  const task = ctx.data || {};
  const model = text(ctx.upstreamModel || ctx.model);
  const key = text(ctx.artifactKey);
  if (MUSIC_MODELS.includes(model)) {
    const links = completionLinks(task);
    const index = Number(key.replace("audio-", "")) - 1;
    if (!links[index]) throw new Error("audio artifact not found");
    return { url: links[index], method: ctx.clientRequest.method, credentialless: true };
  }
  const entries = imageEntries(task);
  if (IMAGE_MODELS.includes(model)) {
    const index = Number(key.replace("image-", "")) - 1;
    if (!entries[index]) throw new Error("image artifact not found");
    if (entries[index].url) {
      let url = entries[index].url;
      if (url.startsWith("/")) url = endpoint(ctx, model) + url;
      if (entries[index].authenticated) return { url: url, method: ctx.clientRequest.method, headers: authHeaders(ctx) };
      return { url: url, method: ctx.clientRequest.method, credentialless: true };
    }
    throw new Error("image artifact is inline base64; use the original image response");
  }
  if (key !== "video") throw new Error("video artifact not found");
  return { url: endpoint(ctx, model) + "/v1/videos/" + encodeURIComponent(ctx.upstreamTaskId || ctx.taskId) + "/content", method: ctx.clientRequest.method, headers: authHeaders(ctx) };
}

function protocolRequest(ctx, kind) {
  if (!ctx.body || (ctx.body.kind !== "json" && ctx.body.kind !== "multipart")) throw new Error("JSON or multipart body required");
  let req;
  if (ctx.body.kind === "json") req = ctx.body.value;
  else {
    req = {};
    const fields = ctx.body.fields || {};
    for (const name of Object.keys(fields)) if (fields[name].length) {
      const value = fields[name][0];
      if (/^[\[{]/.test(value)) { try { req[name] = JSON.parse(value); continue; } catch (_) {} }
      req[name] = value;
    }
    for (const file of ctx.body.files || []) {
      const videoField = kind === "video" && /^(image|input_reference|reference_images|start_frame|end_frame)$/.test(file.field);
      if (!videoField && !/^image(\[\d*\])?$/.test(file.field)) throw new Error(file.field + " is not supported");
      const value = { __fileRef: file.ref, encoding: "dataUrl", mimeType: text(file.mimeType) || "image/png", maxBytes: 31457280 };
      if (videoField) {
        if (file.field === "image" || file.field === "input_reference" || file.field === "start_frame" || file.field === "end_frame") req[file.field] = value;
        else req.reference_images = (Array.isArray(req.reference_images) ? req.reference_images : []).concat([value]);
      } else req.images = (Array.isArray(req.images) ? req.images : []).concat([{ image_url: value }]);
    }
  }
  if (!plain(req)) throw new Error("request body must be an object");
  const model = text(ctx.model || req.model);
  const upstreamModel = text(ctx.upstreamModel || model);
  if (!upstreamModel || !MODELS.includes(upstreamModel)) throw new Error("model is not supported by uselg-interface");
  return { req: req, model: model, upstreamModel: upstreamModel };
}
function responseContent(ctx, task) {
  const body = task.data || {};
  const model = text(ctx.upstreamModel || ctx.model);
  if (MUSIC_MODELS.includes(model)) {
    const links = completionLinks(body);
    const content = links.map((_, index) => {
      const artifact = ctx.artifacts && ctx.artifacts["audio-" + (index + 1)];
      const url = text(artifact && artifact.url);
      if (!url) throw new Error("audio artifact is unavailable");
      return '<audio controls src="' + url.replace(/&/g, "&amp;").replace(/\"/g, "&quot;") + '"></audio>';
    });
    return [{ type: "output_text", text: content.join("\n"), annotations: [], logprobs: [] }];
  }
  const entries = imageEntries(body);
  if (IMAGE_MODELS.includes(model)) {
    const urls = entries.map((item, i) => {
      const artifact = ctx.artifacts && ctx.artifacts["image-" + (i + 1)];
      return text(artifact && artifact.url) || (item.url ? (item.url.startsWith("/") ? endpoint(ctx, model) + item.url : item.url) : dataUrl(item.data, item.mimeType));
    });
    return [{ type: "output_text", text: urls.join("\n"), annotations: [], logprobs: [] }];
  }
  const artifact = ctx.artifacts && ctx.artifacts.video;
  const url = text(artifact && artifact.url) || "/v1/tasks/" + text(task.task_id) + "/artifacts/video/content";
  return [{ type: "output_text", text: "<video controls src=\"" + url.replace(/\"/g, "&quot;") + "\"></video>", annotations: [], logprobs: [] }];
}

export const protocols = {
  openai_image: {
    decodeRequest: function (ctx) {
      const parsed = protocolRequest(ctx, "image");
      if (!IMAGE_MODELS.includes(parsed.upstreamModel)) throw new Error("model is not an image model");
      const req = Object.assign({}, parsed.req, { model: parsed.model });
      return { kind: "submit", model: parsed.model, action: ctx.operation === "edit" ? "image_to_image" : "text_to_image", requestBody: req };
    },
    render: function (ctx, task) {
      const entries = imageEntries(task.data || {});
      return { created: task.created_at, data: entries.map((item) => item.url ? { url: item.url.startsWith("/") ? endpoint(ctx, text(ctx.upstreamModel || ctx.model)) + item.url : item.url } : { b64_json: item.data }) };
    },
  },
  openai_video: {
    decodeRequest: function (ctx) {
      const parsed = protocolRequest(ctx, "video");
      const req = Object.assign({}, parsed.req, { model: parsed.model });
      const seconds = req.seconds === undefined ? req.duration : req.seconds;
      if (!VIDEO_MODELS.includes(parsed.upstreamModel)) throw new Error("model is not a video model");
      if (seconds !== undefined && (!Number.isInteger(Number(seconds)) || Number(seconds) <= 0 || Number(seconds) > 60)) throw new Error("seconds must be an integer between 1 and 60");
      return { kind: "submit", model: parsed.model, action: req.input_reference || req.image || req.reference_images || req.reference_videos || req.input_video ? "image_to_video" : "text_to_video", requestBody: req };
    },
    render: function (ctx, task) {
      const status = { NOT_START: "queued", SUBMITTED: "queued", QUEUED: "queued", IN_PROGRESS: "in_progress", SUCCESS: "completed", FAILURE: "failed" }[task.status] || "unknown";
      return { id: task.task_id, object: "video", model: text(task.properties && task.properties.origin_model_name), status: status, progress: Number(String(task.progress || "0").replace("%", "")), created_at: task.created_at, completed_at: task.updated_at };
    },
  },
  openai_responses: {
    decodeRequest: function (ctx) {
      const parsed = protocolRequest(ctx, "responses");
      const req = parsed.req;
      const input = responsesInput(req);
      if (!input.prompt && !input.images.length && !text(req.prompt)) throw new Error("input is required");
      const body = Object.assign({}, req, { model: parsed.model, prompt: input.prompt || text(req.prompt) });
      if (input.images.length) body.images = input.images.map((image_url) => ({ image_url: image_url }));
      return { kind: "submit", model: parsed.model, action: IMAGE_MODELS.includes(parsed.upstreamModel) ? "image" : MUSIC_MODELS.includes(parsed.upstreamModel) ? "music" : "video", requestBody: body };
    },
    renderEvents: function (ctx, task, previousState) {
      const status = String(task.status || "UNKNOWN").toUpperCase();
      if (status === "SUCCESS") return { events: previousState && previousState.status === status ? [] : [{ type: "output", data: responseContent(ctx, task)[0].text }], state: { status: status }, done: true };
      if (status === "FAILURE") return { events: [{ type: "error", code: "task_failed", message: task.fail_reason || "task failed" }], state: { status: status }, done: true };
      return { events: [{ type: "progress", message: String(status).toLowerCase() }], state: { status: status }, done: false };
    },
    renderFinal: function (ctx, task) { return { output: [{ type: "message", status: "completed", role: "assistant", content: responseContent(ctx, task) }], metadata: { vendor: "uselg" } }; },
  },
};

