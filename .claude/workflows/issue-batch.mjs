export const meta = {
  name: 'issue-batch',
  description: 'issue リストを Survey→Fix+Verify→3層Review→Commit で順次処理（push しない・朝の人間承認前提・sev で codex 要否を判定）',
  phases: [
    { title: 'Survey', detail: 'issue本文+参照資料+既存pattern・sev/scope 判定' },
    { title: 'Fix+Verify', detail: '修正→build/test（+anti-patterns scan）' },
    { title: 'Review', detail: 'L2(red/yellow)のみ codex adversarial・P0/P1のみ継続・最大3R。light(L1)は codex なし' },
    { title: 'Commit', detail: 'commit のみ（push なし）' },
  ],
}

// 使い方: 対象リポのセッションで `/issue-batch`（例:「/issue-batch を #2453 と #2454 で」）
//   モデルはセッション継承 = glm 起動なら GLM / 素の claude なら Opus
// args 要素: 数値 or { n, sev?, group?, title? }
//   sev: red(🔴領域=L2/sol) / yellow(API契約・guard=L2/terra) / light(テスト・docs級=L1・codexなし)
//   sev 省略時は Survey が判定する。

// CFG-START（リポ固有設定 — 複製時はここだけ変える）
const CFG = {
  repo: 'ease-rental-help',
  build: 'npm run build（エラー0・総ページ数が減っていないことを確認）',
  test: 'build 通過のみ（md 中心のため）',
  antiPatterns: null,
  surveyRefs: 'backend atlas との照合: /Volumes/2TB-Speed/Users/takahashiisao/git/ease-rental-backend/.claude/knowledge/atlas/<group>.md（仕様の真実は atlas 側。ページ→atlas 対応は memory docs-site-location）',
  domainNote: 'md-only は低リスクだが push=Render 即本番反映。仕様記述（status/料率/フロー）は atlas・実装と一致させる（推測で書かない）',
  neverAdd: 'dist/**',
  pushNote: 'git push は絶対にしない（push=即本番のため人間承認必須）',
}
// CFG-END

const SEV_TO_MODEL = { red: 'sol', yellow: 'terra' } // light は codex を呼ばない（L1）

const SURVEY_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    title: { type: 'string' },
    sev: { type: 'string', enum: ['red', 'yellow', 'light'] },
    targetFiles: { type: 'array', items: { type: 'string' } },
    approach: { type: 'string' },
    existingPatternRef: { type: 'string' },
    risks: { type: 'array', items: { type: 'string' } },
    scope: { type: 'string', enum: ['clear', 'ambiguous-needs-human', 'cross-repo-dependent'] },
  },
  required: ['title', 'sev', 'targetFiles', 'approach', 'scope'],
}

const FIX_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    changedFiles: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    buildPass: { type: 'boolean' },
    testPass: { type: 'boolean' },
    testDetails: { type: 'string' },
    antiPatternPass: { type: 'boolean' },
    errors: { type: 'string' },
    skipped: { type: 'boolean' },
    skipReason: { type: 'string' },
  },
  required: ['buildPass'],
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    verdict: { type: 'string', enum: ['approve', 'needs-attention', 'codex-unavailable'] },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          severity: { type: 'string', enum: ['P0', 'P1', 'P2'] },
          file: { type: 'string' },
          issue: { type: 'string' },
          suggestion: { type: 'string' },
        },
        required: ['severity', 'issue'],
      },
    },
    rawSummary: { type: 'string' },
  },
  required: ['verdict'],
}

const COMMIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    commitHash: { type: 'string' },
    commitMessage: { type: 'string' },
    pushed: { type: 'boolean' },
    followUps: { type: 'array', items: { type: 'string' } },
    skipped: { type: 'boolean' },
    skipReason: { type: 'string' },
  },
  required: ['pushed'],
}

function surveyPrompt(issue) {
  return `issue-batch / Survey for issue #${issue.n}（repo: ${CFG.repo}）
${issue.title ? `[issue] ${issue.title}` : ''}${issue.sev ? `\n[sev(指定済み)] ${issue.sev}` : ''}

手順:
1. Bash で \`gh issue view ${issue.n}\` を実行し title と本文を取得。
2. 参照資料を読む: ${CFG.surveyRefs}
3. 既存パターンを \`git log --oneline -40\` から探し、必要なら \`git show <hash>\` で diff を参考にする。
4. 関連ファイルを Read で特定（実装・テスト）。
5. sev 判定${issue.sev ? '（指定済みならそのまま返す）' : ''}: red=🔴領域（money/availability/concurrency/auth/webhook/status遷移/schema）/ yellow=API契約・guard・データ整合 / light=テスト追加・docs・filter 程度。過去に P0/P1 が出たファイルは 1 段昇格。
6. scope 判定: clear=方針明確 / cross-repo-dependent=他リポ（FE/Theme/BE/Help）の先行変更が必要 / ambiguous-needs-human=受け入れ条件・期待動作・対象箇所のいずれかが特定できない。
   ⚠️ ambiguous の場合、approach に「人間に確認すべき具体的な質問リスト」を書く（推測で実装方針を立てない）。

schema で返す。`
}

function fixPrompt(issue, survey, findings, round) {
  return `issue-batch / Fix+Verify for issue #${issue.n} (round ${round})（repo: ${CFG.repo}）
[issue] ${survey.title}
[sev] ${issue.sev}
[survey] ${JSON.stringify(survey)}
[前ラウンド指摘（P0/P1 のみ・これだけ直す）] ${findings ? JSON.stringify(findings) : 'なし（初回）'}

手順:
1. survey.approach に従い修正実装。前ラウンド指摘があればその修正を最優先。
   ドメイン規約: ${CFG.domainNote}
2. テストを更新/追加（TDD: failing test → 実装 → GREEN。テスト基盤が無い変更種別なら省略可）。
3. 自分の変更分のみ git add 対象として把握（⚠️絶対 add しない: ${CFG.neverAdd}・自分が触っていない既存の未 commit 変更）。
4. 検証: ${CFG.build}
5. ${CFG.test}
${CFG.antiPatterns ? `6. anti-pattern scan: ${CFG.antiPatterns} → exit 0 なら antiPatternPass=true` : '6. antiPatternPass は true 固定（このリポに scan なし）'}

schema で返す。buildPass 必須・失敗時は errors に最初の3件。skipped=true は着手不能時のみ（skipReason 必須）。`
}

function codexReviewPrompt(issue, survey, round) {
  const m = SEV_TO_MODEL[issue.sev]
  return `issue-batch / Codex Review (L2) for issue #${issue.n} (round ${round})（repo: ${CFG.repo}）
[issue] ${survey.title}
[sev] ${issue.sev} → codex model gpt-5.6-${m}

手順（red-zero SKILL.md Step6 準拠・companion.mjs 直叩き）:
1. Bash \`run_in_background: true\` で実行（完了通知で受ける・最大4分）:
   COMPANION="$(ls -d ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs | sort -Vr | head -1)"
   [ -z "$COMPANION" ] && { echo '{"result":{"verdict":null,"error":"companion not found"}}'; exit 0; }
   node "$COMPANION" adversarial-review --json --scope working-tree -m gpt-5.6-${m} \\
     "focus: issue=#${issue.n} ${survey.title} / 変更=git diff(working-tree) / 観点=${CFG.domainNote} / severity は P0(即修正必須)/P1(merge前修正)/P2(follow-up可) を厳密に区別すること"
2. stdout(JSON) の result.verdict を読む。approve / needs-attention(+findings[] を severity/file/issue/suggestion で整理) / null・parseError→codex-unavailable（他ツールへのフォールバック禁止）。

schema で返す。`
}

function commitPrompt(issue, survey, verdict, rounds, extraFollowUps) {
  return `issue-batch / Commit for issue #${issue.n}（repo: ${CFG.repo}）
[issue] ${survey.title}
[review 結果] ${verdict} (${rounds} round(s))
[follow-up 化する指摘] ${extraFollowUps.length ? JSON.stringify(extraFollowUps) : 'なし'}

手順:
1. \`git status -s\` で自分の変更分を確認し、対象ファイルのみ \`git add\`（⚠️除外: ${CFG.neverAdd}・自分が触っていない既存変更）。
2. Conventional Commits で commit: fix(#${issue.n}): / feat(#${issue.n}): / test(#${issue.n}): / docs(#${issue.n}):
   メッセージ末尾に \`(review ${verdict} r${rounds})\` を付ける。pre-commit hook 失敗時は修正して再 commit。
3. ⚠️ ${CFG.pushNote}
4. follow-up 化する指摘があれば followUps に整理（Issue 作成はしない — 朝の棚卸しで人間が判断）。
5. schema で返す。commitHash・commitMessage・pushed=false。verdict が needs-attention 打切りでも commit するが followUps に未修正指摘を明記。codex-unavailable なら commit せず skipped=true。`
}

// ---- main ----
const ISSUES = (Array.isArray(args) ? args : [])
  .map(a => (typeof a === 'number' ? { n: a } : a))
  .filter(a => a && a.n)
if (!ISSUES.length) {
  return { error: 'args に issue 配列を渡す。例: Workflow({scriptPath, args: [2453, {"n":2454,"sev":"red"}]})' }
}

const results = []

for (const issue of ISSUES) {
  log(`=== #${issue.n} (sev=${issue.sev || '未指定→Survey判定'}) ===`)

  const survey = await agent(surveyPrompt(issue), {
    label: `survey:#${issue.n}`, phase: 'Survey', schema: SURVEY_SCHEMA,
  })
  if (!survey) { results.push({ n: issue.n, status: 'agent-lost' }); continue }
  issue.sev = issue.sev || survey.sev
  issue.title = survey.title

  if (survey.scope !== 'clear') {
    log(`#${issue.n} skipped (${survey.scope}): ${survey.approach}`)
    results.push({
      n: issue.n, title: survey.title, sev: issue.sev, status: 'skipped',
      reason: survey.scope, questions: survey.approach,
      // ambiguous は /issue-clarify（Gate 0）で質問化 → 回答後に再投入
      nextAction: survey.scope === 'ambiguous-needs-human'
        ? `/issue-clarify #${issue.n}（質問を生成→人間承認→投稿）`
        : '先行リポの変更完了を待って再投入',
    })
    continue
  }

  // Fix → Verify →（L2 のみ）codex。継続判定は「指摘の有無」でなく P0/P1 の有無（red-zero 3層ルール）
  let findings = null
  let verdict = 'pending'
  let rounds = 0
  let lastFix = null
  const p2FollowUps = []
  const isL2 = issue.sev === 'red' || issue.sev === 'yellow'

  while (rounds < 3) {
    rounds++
    lastFix = await agent(fixPrompt(issue, survey, findings, rounds), {
      label: `fix:#${issue.n} r${rounds}`, phase: 'Fix+Verify', schema: FIX_SCHEMA,
    })
    if (!lastFix || lastFix.skipped) { verdict = 'fix-skipped'; break }

    if (!lastFix.buildPass || lastFix.testPass === false || lastFix.antiPatternPass === false) {
      findings = [{ severity: 'P0', issue: lastFix.errors || lastFix.testDetails || 'build/test/anti-pattern failed' }]
      verdict = 'needs-attention'
      log(`#${issue.n} r${rounds} verify failed → re-fix（codex スキップ）`)
      continue
    }

    if (!isL2) { verdict = 'l1-pass'; break } // light: codex なし（純正 /code-review は朝にユーザーが必要なら実行）

    const review = await agent(codexReviewPrompt(issue, survey, rounds), {
      label: `codex:#${issue.n} r${rounds}`, phase: 'Review', schema: VERDICT_SCHEMA,
    })
    if (!review) { verdict = 'codex-unavailable'; break }
    verdict = review.verdict
    if (verdict !== 'needs-attention') break

    const p01 = (review.findings || []).filter(f => f.severity === 'P0' || f.severity === 'P1')
    const p2 = (review.findings || []).filter(f => f.severity === 'P2')
    p2FollowUps.push(...p2.map(f => `[P2] ${f.file || ''} ${f.issue}`))
    if (!p01.length) { verdict = 'approve-p2-followup'; break } // P2 だけならラウンドを消費しない
    findings = p01
    log(`#${issue.n} r${rounds} codex P0/P1=${p01.length} P2=${p2.length} → 継続`)
  }

  if (verdict === 'fix-skipped') {
    results.push({ n: issue.n, title: survey.title, sev: issue.sev, status: 'skipped', reason: (lastFix && lastFix.skipReason) || 'fix skipped' })
    continue
  }

  const commit = await agent(commitPrompt(issue, survey, verdict, rounds, p2FollowUps), {
    label: `commit:#${issue.n}`, phase: 'Commit', schema: COMMIT_SCHEMA,
  })

  const status = !commit || commit.skipped
    ? 'skipped'
    : (verdict === 'approve' || verdict === 'l1-pass' || verdict === 'approve-p2-followup')
      ? 'done'
      : verdict // needs-attention(打切り) / codex-unavailable

  results.push({
    n: issue.n, title: survey.title, sev: issue.sev, status, verdict, rounds,
    commitHash: commit && commit.commitHash,
    pushed: !!(commit && commit.pushed),
    followUps: [...p2FollowUps, ...((commit && commit.followUps) || [])],
    skipReason: commit && commit.skipReason,
  })
  log(`#${issue.n} → ${status} (r${rounds}) ${commit && commit.commitHash || ''}`)
}

const done = results.filter(r => r.status === 'done').length
const skipped = results.filter(r => r.status === 'skipped').length
return {
  summary: `issue-batch(${CFG.repo}): done=${done}/${results.length} skipped=${skipped}（push なし・朝の棚卸しで承認）`,
  pushedAny: results.some(r => r.pushed),
  results,
}
