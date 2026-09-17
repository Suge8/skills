#!/usr/bin/env node
// 按搜索意图路由到后端：search / fetch / docs。后端是实现细节，意图是接口。
import { spawnSync } from "node:child_process";

const BRAVE = { label: "精确档", key: "BRAVE_SEARCH_API_KEY", header: "X-Subscription-Token" };
const EXA = { key: "EXA_API_KEY", header: "x-api-key" };
const TINYFISH = { key: "TINYFISH_API_KEY", header: "X-API-Key" };
const FETCH_TARGET = { ...TINYFISH, label: "fetch", free: true };
const LANES = {
	exact: { ...BRAVE, run: braveSearch },
	semantic: { ...EXA, label: "语义档", run: exaSearch },
	code: { ...EXA, label: "代码档", run: exaCode },
	news: { ...TINYFISH, label: "新闻档", free: true, run: (o) => tinyfishSearch(o, "news") },
	papers: { ...TINYFISH, label: "论文档", free: true, run: (o) => tinyfishSearch(o, "research_paper") },
};
const PERIOD_DAYS = { d: 1, w: 7, m: 30, y: 365 };
const FETCH_CHARS = 40000;
const DOC_LINES = 60;

const HELP = `按意图搜索网页、抓取正文、核对官方 API 文档

  web.mjs search "query"              精确档：关键词、报错原文、找准确 URL
  web.mjs search "query" --semantic   语义档：相似实现、概念相关的文章
  web.mjs search "query" --code       代码档：可运行的代码示例与配置片段
  web.mjs search "query" --news       新闻档：小时级时效的报道（免费）
  web.mjs search "query" --papers     论文档：学术论文，带引用数（免费）
  web.mjs fetch <url...>              取正文转 Markdown，一次最多 10 个（免费）
  web.mjs docs <库名|库ID> "问题"      按库当前版本核对官方 API

search 选项
  -n N              结果条数，默认 8
  --site DOMAIN     限定域名，逗号分隔或重复传入
  --not DOMAIN      排除域名
  --recent d|w|m|y  最近一天/周/月/年
  --after DATE      YYYY-MM-DD 之后发布（论文档按年份取整）
  --before DATE     YYYY-MM-DD 之前发布
  --json            输出原始 JSON

fetch 选项
  --chars N         每页正文字符上限，默认 ${FETCH_CHARS}，0 为不截断
  --links           一并输出页面内链接
  --json            输出原始 JSON

docs 选项
  --lines N         输出行数上限，默认 ${DOC_LINES}，0 为全量

代码档只接受查询词，其余 search 选项对它无效。`;

function fail(message) {
	console.error(message);
	process.exit(1);
}

function parseArgs(argv) {
	const opts = { urls: [], words: [], site: [], not: [], count: 8, chars: FETCH_CHARS, lines: DOC_LINES };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg.startsWith("--") && arg.slice(2) in LANES) opts.lane = arg.slice(2);
		else if (arg === "-n") opts.count = Number(argv[++i]);
		else if (arg === "--site") opts.site.push(...String(argv[++i] ?? "").split(",").filter(Boolean));
		else if (arg === "--not") opts.not.push(...String(argv[++i] ?? "").split(",").filter(Boolean));
		else if (arg === "--recent") opts.recent = argv[++i];
		else if (arg === "--after") opts.after = argv[++i];
		else if (arg === "--before") opts.before = argv[++i];
		else if (arg === "--chars") opts.chars = Number(argv[++i]);
		else if (arg === "--lines") opts.lines = Number(argv[++i]);
		else if (arg === "--links") opts.links = true;
		else if (arg === "--json") opts.json = true;
		else if (arg.startsWith("-")) fail(`未知选项 ${arg}\n\n${HELP}`);
		else if (/^https?:\/\//.test(arg)) opts.urls.push(arg);
		else opts.words.push(arg);
	}
	opts.query = opts.words.join(" ");
	return opts;
}

// 额度耗尽、鉴权失败与限流都指向同一件事：换一条能用的档，由调用者决定换哪条。
function backendError(target, status, body) {
	const detail = body.slice(0, 200).replace(/\s+/g, " ");
	if (status !== 402 && status !== 401 && status !== 429) fail(`${target.label} ${status}: ${detail}`);
	const alt = target.free ? "" : "\n免费替代：--news（时效报道）、--papers（论文）、fetch <url>（已知 URL 取正文）";
	const reason = status === 429 ? "触发限流，稍后重试" : "额度耗尽或密钥失效（Brave 与 Exa 的免费额度每月 1 号重置）";
	fail(`${target.label}不可用：${reason}。${alt}\n原始响应 ${status}: ${detail}`);
}

async function callApi(target, url, init = {}) {
	const key = process.env[target.key];
	if (!key) fail(`缺少 ${target.key}，${target.label}不可用`);
	const response = await fetch(url, { ...init, headers: { Accept: "application/json", [target.header]: key, ...init.headers } });
	const body = await response.text();
	if (!response.ok) backendError(target, response.status, body);
	return JSON.parse(body);
}

function sinceDate(opts) {
	if (opts.after) return opts.after;
	if (!opts.recent) return null;
	const days = PERIOD_DAYS[opts.recent] ?? fail(`--recent 只接受 d|w|m|y，收到 ${opts.recent}`);
	return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

const ENTITIES = { "&quot;": '"', "&amp;": "&", "&lt;": "<", "&gt;": ">", "&#x27;": "'", "&#39;": "'" };
const clean = (text) => String(text ?? "").replace(/<[^>]+>/g, "").replace(/&[#\w]+;/g, (e) => ENTITIES[e] ?? e).replace(/\s+/g, " ").trim();

async function braveSearch(opts) {
	const query = [opts.query, ...opts.site.map((d) => `site:${d}`), ...opts.not.map((d) => `-site:${d}`)].join(" ");
	const params = new URLSearchParams({ q: query, count: String(opts.count) });
	const since = sinceDate(opts);
	if (opts.recent && !opts.after) params.set("freshness", `p${opts.recent}`);
	else if (since) params.set("freshness", `${since}to${opts.before ?? new Date().toISOString().slice(0, 10)}`);
	const data = await callApi(LANES.exact, `https://api.search.brave.com/res/v1/web/search?${params}`);
	return { raw: data, items: (data.web?.results ?? []).map((r) => ({ title: clean(r.title), url: r.url, date: r.age, snippet: clean(r.description) })) };
}

async function exaSearch(opts) {
	const since = sinceDate(opts);
	const data = await callApi(LANES.semantic, "https://api.exa.ai/search", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: opts.query,
			numResults: opts.count,
			type: "auto",
			...(opts.site.length ? { includeDomains: opts.site } : {}),
			...(opts.not.length ? { excludeDomains: opts.not } : {}),
			...(since ? { startPublishedDate: since } : {}),
			...(opts.before ? { endPublishedDate: opts.before } : {}),
			contents: { highlights: true },
		}),
	});
	return {
		raw: data,
		items: (data.results ?? []).map((r) => ({
			title: clean(r.title),
			url: r.url,
			date: r.publishedDate?.slice(0, 10),
			snippet: clean((r.highlights ?? []).slice(0, 2).join(" … ")).slice(0, 300),
		})),
	};
}

async function exaCode(opts) {
	const data = await callApi(LANES.code, "https://api.exa.ai/context", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query: opts.query, tokensNum: "dynamic" }),
	});
	return { raw: data, text: data.response ?? "无代码上下文返回" };
}

function tinyfishDates(opts, domainType, params) {
	const since = sinceDate(opts);
	if (domainType === "research_paper") {
		if (since) params.set("pub_year_min", since.slice(0, 4));
		if (opts.before) params.set("pub_year_max", opts.before.slice(0, 4));
		return;
	}
	if (opts.recent && !opts.after) params.set("recency_minutes", String(PERIOD_DAYS[opts.recent] * 1440));
	else if (since) params.set("after_date", since);
	if (opts.before) params.set("before_date", opts.before);
}

async function tinyfishSearch(opts, domainType) {
	const params = new URLSearchParams({ query: opts.query, domain_type: domainType });
	if (opts.site.length) params.set("include_domains", opts.site.join(","));
	if (opts.not.length) params.set("exclude_domains", opts.not.join(","));
	tinyfishDates(opts, domainType, params);
	const data = await callApi(LANES[domainType === "news" ? "news" : "papers"], `https://api.search.tinyfish.ai/?${params}`);
	return {
		raw: data,
		items: (data.results ?? []).slice(0, opts.count).map((r) => ({
			title: clean(r.title),
			url: r.url,
			date: [r.publisher, r.date, r.venue, r.year, r.cited_by_count && `${r.cited_by_count} 引用`].filter(Boolean).join(" · "),
			snippet: clean(r.snippet),
		})),
	};
}

async function runSearch(opts) {
	if (!opts.query) fail(`search 需要查询词\n\n${HELP}`);
	const lane = opts.lane ?? "exact";
	const { raw, items, text } = await LANES[lane].run(opts);
	if (opts.json) return console.log(JSON.stringify(raw, null, 2));
	if (text) return console.log(text);
	console.log(`# ${LANES[lane].label}: ${opts.query}\n`);
	if (!items.length) return console.log("无结果");
	for (const [i, item] of items.entries()) {
		console.log(`${i + 1}. ${item.title}${item.date ? ` · ${item.date}` : ""}\n   ${item.url}\n   ${item.snippet}\n`);
	}
}

async function runFetch(opts) {
	if (!opts.urls.length) fail(`fetch 需要至少一个 http(s) URL\n\n${HELP}`);
	if (opts.urls.length > 10) fail(`fetch 一次最多 10 个 URL，收到 ${opts.urls.length}`);
	const data = await callApi(FETCH_TARGET, "https://api.fetch.tinyfish.ai/", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ urls: opts.urls, format: "markdown", links: Boolean(opts.links) }),
	});
	if (opts.json) return console.log(JSON.stringify(data, null, 2));
	for (const result of data.results ?? []) {
		const body = opts.chars > 0 && result.text?.length > opts.chars
			? `${result.text.slice(0, opts.chars)}\n\n[已截断 ${result.text.length - opts.chars} 字符，需要全文加 --chars 0]`
			: result.text;
		console.log(`# ${result.title ?? result.url}\n${result.final_url ?? result.url}\n\n${body}\n`);
		if (opts.links && result.links?.length) console.log(`链接: ${result.links.slice(0, 40).join(" ")}\n`);
	}
	for (const error of data.errors ?? []) console.error(`取不到 ${error.url}: ${error.error ?? error.message ?? JSON.stringify(error)}`);
	if (!(data.results ?? []).length) process.exit(1);
}

function ctx7(args) {
	const proc = spawnSync("npx", ["-y", "ctx7", ...args], { encoding: "utf8" });
	if (proc.status !== 0) fail(`ctx7 失败: ${(proc.stderr || proc.stdout || "").trim().slice(0, 300)}`);
	return proc.stdout.trim();
}

function runDocs(opts) {
	const [library, ...rest] = opts.words;
	const question = rest.join(" ");
	if (!library || !question) fail(`docs 需要库名和问题，例如 docs react "useEffect cleanup"\n\n${HELP}`);
	const id = /^\/[\w.-]+\/[\w.-]+/.test(library)
		? library
		: ctx7(["library", library, question]).match(/Context7-compatible library ID:\s*(\S+)/)?.[1]
			?? fail(`Context7 找不到库 ${library}，换个写法或用 /组织/项目 形式的库 ID`);
	const output = ctx7(["docs", id, question]);
	const lines = output.split("\n");
	if (opts.lines > 0 && lines.length > opts.lines) {
		return console.log(`${lines.slice(0, opts.lines).join("\n")}\n\n[已截断 ${lines.length - opts.lines} 行，需要全量加 --lines 0]`);
	}
	console.log(output);
}

const [verb, ...rest] = process.argv.slice(2);
if (!verb || verb === "-h" || verb === "--help") {
	console.log(HELP);
	process.exit(verb ? 0 : 1);
}
const VERBS = { search: runSearch, fetch: runFetch, docs: runDocs };
if (!(verb in VERBS)) fail(`未知命令 ${verb}\n\n${HELP}`);
await VERBS[verb](parseArgs(rest));
