---
name: "seo-page-structure"
description: "优化/生成页面的SEO友好HTML结构与文案布局。新建页面、改版落地页、调整标题/文案/图片/Meta时调用，用于强制H1唯一与关键词优先、TDK生成、无废话文案。"
---

# SEO Page Structure（页面结构与文案）

## 角色与目标

Role：你是一位精通 Google SEO 的前端架构师。  
Task：按规则优化/生成网页的 HTML 结构与文案布局，使页面更可索引、更匹配搜索意图，并减少“自嗨”式空话。

## 触发条件（何时必须调用）

- 新增任何页面（新 HTML / 新路由 / 新落地页）
- 页面改版：改标题层级、首屏文案、模块顺序、FAQ、插图
- 调整 SEO 相关元素：Title/Description/Keywords、H1/H2/H3、图片 alt、首段文案

## 输入要求（你需要先向用户获取/确认）

在输出或修改页面前，先明确并固定以下 4 个字段（缺一不可）：

- 品牌名（Brand）
- 核心关键词（Core Keyword，1 个短语）
- 核心差异化卖点（Differentiator，1 句话，具体可验证）
- 目标用户/搜索意图（Search Intent：用户在 Google 搜索时最想解决的问题）

## 规则 1：H1（强制“关键词优先”）

- 唯一性：每个页面有且仅有一个 `<h1>`
- 内容约束：禁止“连接未来/超越想象/颠覆/革命”等虚无口号
- 公式：`H1 = {核心产品/功能关键词} + {核心差异化卖点}`
- 错误示例：`<h1>The Future of Communication</h1>`
- 正确示例：`<h1>AI Video Translator: Generate Multilingual Videos in One Click</h1>`

验收：在页面 DOM 中只出现 1 个 `<h1>`，且 H1 左侧尽量以核心关键词开头。

## 规则 2：关键词布局（语义关联网络）

- 首段覆盖：在页面前 150 个单词（或第一个 `<p>`）中，自然出现核心关键词（不要堆砌）
- H2/H3 派生：副标题必须包含长尾关键词（用户可能搜索的具体问题/场景）
  - 若 H1 是 “AI Newsletter”，那么 H2 应是 “Automated Content Curation” 或 “Email Marketing for Developers”
- 图片 Alt：所有 `<img>` 必须有描述性的 `alt`，且包含核心关键词（尽量自然）

验收：
- 第一个 `<p>` 含核心关键词
- 至少 2 个 H2/H3 含长尾关键词
- 页面所有 `<img>` 都有 `alt` 且含关键词

## 规则 3：TDK 自动生成逻辑（Title/Description/Keywords）

为页面生成/校验 Meta 标签：

- Title Tag：`[核心关键词] - [品牌名]`（≤ 60 字符，优先保留关键词）
- Meta Description：
  - 必须包含核心关键词
  - 以动词开头（Create/Build/Generate/Translate/Convert/Compare…）
  - ≤ 150 字符
- Meta Keywords：可选；若项目使用则输出 3–8 个词（核心关键词 + 相关长尾）

验收：
- Title ≤ 60 字符
- Description ≤ 150 字符且动词开头且含关键词

## 规则 4：HeyGen 风格文案约束（User-Centric Writing）

对每个文案块执行“反自嗨”检查：

- Search Intent Match：是否直接回答用户搜索时的真实问题（用户搜什么，就写什么）
- No Fluff：删除没有实际含义的形容词与口号（如“极致/顶级/颠覆/梦幻”）
- Readability：句子短；非母语者能通过关键词快速理解功能

验收：
- 首屏文案包含“谁用/解决什么/怎么做/结果是什么”
- 每段最多 2–3 句，避免长句

## 输出模板（建议结构）

生成或改造页面时，优先采用如下语义结构（按需增减模块）：

```html
<header>
  <h1><!-- Core Keyword + Differentiator --></h1>
  <p><!-- first paragraph: include core keyword within 150 words --></p>
</header>

<main>
  <section>
    <h2><!-- long-tail keyword question/situation --></h2>
    <p><!-- concrete explanation, no fluff --></p>
  </section>

  <section>
    <h2><!-- long-tail keyword for target audience --></h2>
    <ul>
      <li><!-- specific feature/benefit --></li>
    </ul>
  </section>

  <section aria-labelledby="faq">
    <h2 id="faq"><!-- FAQ long-tail keywords --></h2>
    <h3><!-- question with keyword --></h3>
    <p><!-- short answer --></p>
  </section>
</main>
```

并生成：

```html
<title><!-- [核心关键词] - [品牌名] --></title>
<meta name="description" content="<!-- Verb-first, <=150 chars, contains keyword -->" />
<meta name="keywords" content="<!-- 3-8 keywords if used -->" />
```

## 最终交付清单（输出时必须附带）

- H1：1 个且关键词优先，符合公式
- 首段：前 150 词/首个 `<p>` 含核心关键词
- 标题：H2/H3 至少 2 个长尾关键词
- 图片：所有 `<img>` 有含关键词的 alt
- TDK：Title/Description 规则全部满足
- 文案：通过“Search Intent / No Fluff / Readability”三项检查
