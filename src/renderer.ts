import { App, TFile, MarkdownRenderer, Component } from "obsidian";

const THEME = "#65A692";

export async function renderNote(
	app: App,
	file: TFile,
	rawContent: string
): Promise<{ html: string; css: string }> {
	const content = rawContent.replace(/^---[\s\S]*?---\n?/, "");

	const el = document.createElement("div");
	el.className = "markdown-preview-view markdown-rendered";

	const component = new Component();
	component.load();
	await MarkdownRenderer.render(app, content, el, file.path, component);
	component.unload();

	// Remove Obsidian's native copy buttons to avoid duplicates
	el.querySelectorAll(".copy-code-button").forEach((b) => b.remove());

	// Wrap each table in .table-wrapper for outer border + border-radius
	el.querySelectorAll("table").forEach((table) => {
		const wrapper = document.createElement("div");
		wrapper.className = "table-wrapper";
		table.parentNode?.insertBefore(wrapper, table);
		wrapper.appendChild(table);
	});

	return { html: el.innerHTML, css: buildCss() };
}

export function buildHtml(title: string, htmlBody: string): string {
	const svgCopy = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
	const svgCheck = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${THEME}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

	return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\\\[',right:'\\\\]',display:true},{left:'\\\\(',right:'\\\\)',display:false}]})"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="markdown-preview-view">
${htmlBody}
  </div>
  <script>
    (function() {
      var COPY_ICON = '${svgCopy}';
      var CHECK_ICON = '${svgCheck}';
      document.querySelectorAll('pre').forEach(function(pre) {
        var btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.title = '复制代码';
        btn.innerHTML = COPY_ICON;
        pre.appendChild(btn);
        btn.addEventListener('click', function() {
          var code = pre.querySelector('code');
          navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(function() {
            btn.innerHTML = CHECK_ICON;
            setTimeout(function() { btn.innerHTML = COPY_ICON; }, 2000);
          });
        });
      });
    })();
  </script>
</body>
</html>`;
}

export function buildCss(): string {
	return `/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; }

/* ── Page ── */
body {
  margin: 0;
  padding: 2rem 1rem;
  background: #fff;
  font-family: -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #24292e;
}

/* ── Content container ── */
.markdown-preview-view {
  max-width: 780px;
  margin: 0 auto;
  padding: 2.5rem 3rem;
}

/* ── Headings ── */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  margin: 1.5em 0 0.5em;
}
h1 { font-size: 1.75em; }
h2 { font-size: 1.4em; }
h3 { font-size: 1.15em; }
h4, h5, h6 { font-size: 1em; }

/* ── Paragraph ── */
p { margin: 0.8em 0; }

/* ── Links ── */
a {
  color: ${THEME};
  font-size: 0.9rem;
  text-decoration: none;
}
a:hover { text-decoration: underline; }
a:not(.internal-link):not(.footnote-backref)[href^="http"]::after {
  content: '↗';
  font-size: 0.65em;
  margin-left: 2px;
  opacity: 0.7;
  vertical-align: super;
}

/* ── Highlight ── */
mark {
  background: #FCEDB5;
  color: inherit;
  border-radius: 2px;
  padding: 0 2px;
}

/* ── Inline code ── */
:not(pre) > code {
  font-family: "SF Mono", "Fira Code", Menlo, Courier, monospace;
  font-size: 0.8em;
  color: #347698;
  background: #F3F3F3;
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

/* ── Code block ── */
pre {
  position: relative;
  background: #f8f8f8;
  border: 1px solid #DADCDE;
  border-radius: 5px;
  padding: 1rem 1.2rem;
  overflow: auto;
  font-size: 13px;
  line-height: 1.5;
}
pre code {
  font-family: "SF Mono", "Fira Code", Menlo, Courier, monospace;
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
  border-radius: 0;
}

/* ── Copy button ── */
.copy-btn {
  position: absolute;
  top: 8px; right: 8px;
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #DADCDE;
  border-radius: 5px;
  cursor: pointer;
  color: #888;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0;
}
pre:hover .copy-btn { opacity: 1; }
.copy-btn:hover { background: #f0f0f0; color: #444; }

/* ── Syntax highlighting (Prism GitHub light) ── */
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: #6e7781; font-style: italic; }
.token.string, .token.attr-value, .token.char, .token.inserted { color: #0a3069; }
.token.punctuation, .token.operator { color: #24292f; }
.token.number, .token.boolean, .token.variable, .token.constant, .token.regex { color: #0550ae; }
.token.keyword, .token.atrule, .token.attr-name { color: #cf222e; }
.token.function, .token.class-name, .token.builtin { color: #8250df; }
.token.tag, .token.selector, .token.property { color: #116329; }
.token.deleted { color: #82071e; background: #ffebe9; }
.token.important, .token.bold { font-weight: bold; }
.token.italic { font-style: italic; }
.token.entity { cursor: help; }

/* ── Blockquote ── */
blockquote {
  position: relative;
  margin: 1em 0;
  padding: 0.8rem 1rem 0.8rem 1.3rem;
  background: rgba(101, 166, 146, 0.05);
  border-radius: 6px;
  border: none;
}
blockquote::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  width: 0.3rem;
  background: ${THEME};
  border-radius: 6px 0 0 6px;
}
blockquote p { color: #81888D; font-size: 14px; margin: 0; }

/* ── Task list ── */
.contains-task-list { list-style: none; padding-left: 0.25em; }
.task-list-item { display: flex; align-items: baseline; gap: 0.5em; margin: 0.3em 0; }
.task-list-item-checkbox {
  appearance: none;
  -webkit-appearance: none;
  flex-shrink: 0;
  width: 1em; height: 1em;
  border: 1.5px solid ${THEME};
  border-radius: 3px;
  background: #fff;
  position: relative;
  cursor: default;
  translate: 0 1px;
}
.task-list-item-checkbox:checked {
  background: ${THEME};
  border-color: ${THEME};
}
.task-list-item-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 2px; top: -1px;
  width: 4px; height: 8px;
  border: 2px solid #fff;
  border-top: none; border-left: none;
  transform: rotate(45deg);
}
.task-list-item.is-checked > *:not(.task-list-item-checkbox) { color: #aaa; text-decoration: line-through; }

/* ── Lists ── */
ul, ol { padding-left: 1.5em; margin: 0.8em 0; }
li { margin: 0.3em 0; }

/* ── Table ── */
.table-wrapper {
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #DADCDE;
  margin: 1em 0;
}
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead {
  background: #F3F9F7;
  border-bottom: 1px solid #DADCDE;
}
th, td {
  color: rgb(107, 107, 107);
  padding: 10px 13px;
  border-left: 1px solid #DADCDE;
  text-align: left;
}
th { font-weight: 700; }
th:first-child, td:first-child { border-left: none; }
tbody tr { border-bottom: 1px solid #DADCDE; }
tbody tr:last-child { border-bottom: none; }
tbody tr:nth-child(even) { background: rgba(101, 166, 146, 0.03); }

/* ── Callout ── */
.callout {
  border-radius: 6px;
  margin: 1em 0;
  overflow: hidden;
  border-left: 4px solid ${THEME};
  background: rgba(101, 166, 146, 0.05);
}
.callout-title {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 14px;
  background: rgba(101, 166, 146, 0.1);
  font-weight: 600; font-size: 0.9em;
  color: ${THEME};
}
.callout-icon { display: flex; align-items: center; }
.callout-icon svg { width: 15px; height: 15px; }
.callout-content { padding: 10px 14px; }
.callout-content > p:first-child { margin-top: 0; }
.callout-content > p:last-child { margin-bottom: 0; }

.callout[data-callout="warning"],
.callout[data-callout="caution"],
.callout[data-callout="attention"] { border-left-color: #E6AC44; background: rgba(230,172,68,0.05); }
.callout[data-callout="warning"] .callout-title,
.callout[data-callout="caution"] .callout-title,
.callout[data-callout="attention"] .callout-title { background: rgba(230,172,68,0.1); color: #E6AC44; }

.callout[data-callout="danger"],.callout[data-callout="error"],
.callout[data-callout="failure"],.callout[data-callout="fail"],
.callout[data-callout="missing"],.callout[data-callout="bug"] { border-left-color: #E06C75; background: rgba(224,108,117,0.05); }
.callout[data-callout="danger"] .callout-title,.callout[data-callout="error"] .callout-title,
.callout[data-callout="failure"] .callout-title,.callout[data-callout="fail"] .callout-title,
.callout[data-callout="missing"] .callout-title,.callout[data-callout="bug"] .callout-title { background: rgba(224,108,117,0.1); color: #E06C75; }

.callout[data-callout="info"],.callout[data-callout="abstract"],
.callout[data-callout="summary"],.callout[data-callout="tldr"],.callout[data-callout="todo"] { border-left-color: #4A90D9; background: rgba(74,144,217,0.05); }
.callout[data-callout="info"] .callout-title,.callout[data-callout="abstract"] .callout-title,
.callout[data-callout="summary"] .callout-title,.callout[data-callout="tldr"] .callout-title,
.callout[data-callout="todo"] .callout-title { background: rgba(74,144,217,0.1); color: #4A90D9; }

.callout[data-callout="example"] { border-left-color: #7B8CDE; background: rgba(123,140,222,0.05); }
.callout[data-callout="example"] .callout-title { background: rgba(123,140,222,0.1); color: #7B8CDE; }

.callout[data-callout="quote"],.callout[data-callout="cite"] { border-left-color: #999; background: rgba(153,153,153,0.05); }
.callout[data-callout="quote"] .callout-title,.callout[data-callout="cite"] .callout-title { background: rgba(153,153,153,0.1); color: #888; }

/* ── Block math ── */
mjx-container[display="true"] { display: block; overflow-x: auto; margin: 1em 0; text-align: center; }
mjx-container { vertical-align: middle; }

/* ── Footnote ref ── */
.footnote-ref a, sup.footnote-ref a { color: ${THEME}; font-size: 0.8em; }

/* ── Footnote content ── */
.footnotes { margin-top: 2em; border-top: 1px dashed #DADCDE; padding-top: 1em; }
.footnotes ol { padding-left: 1.5em; }
.footnotes li, .footnotes p { font-size: 0.75rem; color: #666; margin: 0.3em 0; }
.footnote-backref { color: #bbb !important; font-size: 0.75em; margin-left: 4px; }
.footnote-backref:hover { color: ${THEME} !important; }

/* ── HR ── */
hr { border: none; border-top: 1px dashed #DADCDE; margin: 1.5em 0; }

/* ── Image ── */
img { max-width: 100%; border-radius: 4px; }

/* ── Misc ── */
strong { font-weight: 600; }
em { font-style: italic; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; transition: background 0.3s; }
body:hover ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.4); }
::-webkit-scrollbar-track { background: transparent; }
`;
}
