const Anthropic = require("@anthropic-ai/sdk");
const db = require("../config/db");

const DEMO_USER_ID = 1;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "not-configured" });

function cleanJson(raw) {
  return raw.replace(/```json|```/g, "").trim();
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function uniqueByMessage(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.severity || item.category}:${item.message || item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findLine(lines, pattern) {
  const index = lines.findIndex((line) => pattern.test(line));
  return index >= 0 ? index + 1 : 0;
}

function hasRecursiveCall(code) {
  const jsFunctionPattern = /function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g;
  let match;
  while ((match = jsFunctionPattern.exec(code))) {
    const afterDeclaration = code.slice(match.index + match[0].length);
    if (new RegExp(`\\b${match[1]}\\s*\\(`).test(afterDeclaration)) return true;
  }

  const pyFunctionPattern = /def\s+([A-Za-z_]\w*)\s*\([^)]*\)\s*:/g;
  while ((match = pyFunctionPattern.exec(code))) {
    const afterDeclaration = code.slice(match.index + match[0].length);
    if (new RegExp(`\\b${match[1]}\\s*\\(`).test(afterDeclaration)) return true;
  }

  const javaMethodPattern = /(?:public|private|protected)?\s*(?:static\s+)?(?:[\w<>\[\]]+\s+)+([A-Za-z_]\w*)\s*\([^)]*\)\s*\{/g;
  while ((match = javaMethodPattern.exec(code))) {
    const afterDeclaration = code.slice(match.index + match[0].length);
    if (new RegExp(`\\b${match[1]}\\s*\\(`).test(afterDeclaration)) return true;
  }

  return false;
}

function braceNestingDepth(code) {
  let depth = 0;
  let maxDepth = 0;
  for (const char of code) {
    if (char === "{") {
      depth += 1;
      maxDepth = Math.max(maxDepth, depth);
    } else if (char === "}") {
      depth = Math.max(0, depth - 1);
    }
  }
  return maxDepth;
}

async function getAnthropicReport(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 1400,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content.map((block) => block.text || "").join("");
  return normalizeReport(JSON.parse(cleanJson(raw)));
}

function normalizeReport(report) {
  const safe = report || {};
  return {
    overallScore: clamp(safe.overallScore ?? 70),
    complexityScore: clamp(safe.complexityScore ?? 70),
    readabilityScore: clamp(safe.readabilityScore ?? 70),
    duplicationScore: clamp(safe.duplicationScore ?? 80),
    maintainabilityScore: clamp(safe.maintainabilityScore ?? 70),
    linesOfCode: Math.max(0, Number(safe.linesOfCode || 0)),
    cyclomaticComplexity: Math.max(1, Number(safe.cyclomaticComplexity || 1)),
    issues: Array.isArray(safe.issues) ? safe.issues : [],
    suggestions: Array.isArray(safe.suggestions) ? safe.suggestions : [],
    summary: safe.summary || "CodeInsight completed a structured code review.",
    strengths: Array.isArray(safe.strengths) ? safe.strengths : [],
    grade: safe.grade || gradeFromScore(safe.overallScore || 70),
  };
}

function gradeFromScore(score) {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B+";
  if (score >= 65) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

function buildLocalReport(code, language) {
  const normalizedLanguage = language.toLowerCase();
  const isPython = normalizedLanguage.includes("python");
  const isJava = normalizedLanguage.includes("java") && !normalizedLanguage.includes("javascript");
  const lines = code.split(/\r?\n/);
  const trimmedLines = lines.map((line) => line.trim());
  const nonEmptyLines = trimmedLines.filter(Boolean).length;
  const commentLines = trimmedLines.filter((line) =>
    line.startsWith("//") || line.startsWith("#") || line.startsWith("/*") || line.startsWith("*")
  ).length;
  const longLineCount = lines.filter((line) => line.length > 110).length;
  const duplicateLineCount = (() => {
    const counts = new Map();
    trimmedLines
      .filter((line) => line.length > 8 && !line.startsWith("//") && !line.startsWith("#"))
      .forEach((line) => counts.set(line, (counts.get(line) || 0) + 1));
    return [...counts.values()].filter((count) => count > 1).reduce((total, count) => total + count - 1, 0);
  })();

  const branchMatches = code.match(/\b(if|else if|for|while|case|catch|except|switch)\b|\?|&&|\|\|/g) || [];
  const cyclomaticComplexity = 1 + branchMatches.length;
  const indentationDepth = Math.max(
    0,
    ...lines.map((line) => {
      const leading = line.match(/^\s*/)?.[0] || "";
      return Math.floor(leading.replace(/\t/g, "  ").length / 2);
    })
  );
  const nestingDepth = isJava ? braceNestingDepth(code) : indentationDepth;

  const issues = [];
  const suggestions = [];
  const strengths = [];

  const addIssue = (severity, message, line) => issues.push({ severity, message, line });
  const addSuggestion = (category, title, description) => suggestions.push({ category, title, description });

  if (/\bvar\b/.test(code)) {
    addIssue("warning", "Uses var, which can create confusing function-scoped variables.", findLine(lines, /\bvar\b/));
    addSuggestion("Best Practice", "Prefer let or const", "Replace var with const for values that never change and let for reassigned values.");
  }

  if (/\b(eval|exec)\s*\(/.test(code)) {
    addIssue("critical", "Dynamic code execution can introduce serious security vulnerabilities.", findLine(lines, /\b(eval|exec)\s*\(/));
    addSuggestion("Security", "Remove dynamic execution", "Avoid eval or exec. Use explicit parsing, lookup tables, or safe library APIs instead.");
  }

  if (isPython && /subprocess\.(run|call|Popen)\s*\([^)]*shell\s*=\s*True/s.test(code)) {
    addIssue("critical", "subprocess is executed with shell=True, which can allow command injection.", findLine(lines, /shell\s*=\s*True/));
    addSuggestion("Security", "Avoid shell=True", "Pass command arguments as a list and keep shell=False unless a shell is absolutely required.");
  }

  if (isPython && /requests\.\w+\s*\([^)]*verify\s*=\s*False/s.test(code)) {
    addIssue("critical", "TLS certificate verification is disabled.", findLine(lines, /verify\s*=\s*False/));
    addSuggestion("Security", "Keep certificate verification enabled", "Remove verify=False so HTTPS requests validate certificates correctly.");
  }

  if (isPython && /^\s*except\s*:/m.test(code)) {
    addIssue("warning", "Bare except catches every exception and can hide real failures.", findLine(lines, /^\s*except\s*:/));
    addSuggestion("Best Practice", "Catch specific exceptions", "Replace bare except with the exact exception types you expect to handle.");
  }

  if (isPython && /def\s+\w+\s*\([^)]*=\s*(\[\]|\{\}|set\(\))/m.test(code)) {
    addIssue("warning", "Mutable default argument can leak state between function calls.", findLine(lines, /def\s+\w+\s*\([^)]*=\s*(\[\]|\{\}|set\(\))/));
    addSuggestion("Best Practice", "Use None for mutable defaults", "Default the parameter to None and create the list, dict, or set inside the function.");
  }

  if (isPython && /open\s*\([^)]*\)(?!\s*as\s+\w+)/.test(code) && !/with\s+open\s*\(/.test(code)) {
    addIssue("warning", "File is opened without a context manager.", findLine(lines, /open\s*\(/));
    addSuggestion("Maintainability", "Use with open(...)", "Use a with block so files close automatically even when exceptions occur.");
  }

  if (isJava && /String\s+\w+\s*=|String\s+\w+\s*;/.test(code) && /\.equals\s*\(/.test(code) === false && /if\s*\([^)]*\w+\s*==\s*["'\w]/.test(code)) {
    addIssue("warning", "String comparison appears to use == instead of equals().", findLine(lines, /if\s*\([^)]*\w+\s*==\s*["'\w]/));
    addSuggestion("Best Practice", "Use equals for strings", "Use value.equals(other) or Objects.equals(value, other) to compare String contents.");
  }

  if (isJava && /catch\s*\([^)]*(Exception|Throwable)[^)]*\)\s*\{\s*\}/s.test(code)) {
    addIssue("warning", "Empty catch block hides failures and makes debugging difficult.", findLine(lines, /catch\s*\(/));
    addSuggestion("Maintainability", "Handle or log exceptions", "Handle the exception, rethrow it with context, or log enough detail to diagnose the failure.");
  }

  if (isJava && /new\s+(Scanner|FileInputStream|FileReader|BufferedReader)\s*\(/.test(code) && !/try\s*\([^)]*new\s+(Scanner|FileInputStream|FileReader|BufferedReader)/.test(code) && !/\.close\s*\(\s*\)/.test(code)) {
    addIssue("warning", "Closeable resource may not be closed.", findLine(lines, /new\s+(Scanner|FileInputStream|FileReader|BufferedReader)\s*\(/));
    addSuggestion("Maintainability", "Use try-with-resources", "Wrap closeable resources in try-with-resources so they are closed automatically.");
  }

  if (isJava && /public\s+(?!class|interface|enum)\w+[\w<>\[\]]*\s+\w+\s*(=|;)/.test(code)) {
    addIssue("info", "Public mutable field reduces encapsulation.", findLine(lines, /public\s+(?!class|interface|enum)\w+[\w<>\[\]]*\s+\w+\s*(=|;)/));
    addSuggestion("Best Practice", "Encapsulate fields", "Prefer private fields with methods that protect invariants and validation.");
  }

  if (/(password|api[_-]?key|secret|token)\s*[:=]\s*['"][^'"]+['"]/i.test(code)) {
    addIssue("critical", "Possible hard-coded secret detected.", findLine(lines, /(password|api[_-]?key|secret|token)\s*[:=]\s*['"]/i));
    addSuggestion("Security", "Move secrets to environment variables", "Store credentials in .env or a secret manager and keep them out of source control.");
  }

  if (/SELECT\s+.*\+|query\s*\([^)]*\+|execute\s*\([^)]*\+/i.test(code)) {
    addIssue("critical", "SQL appears to be built with string concatenation.", findLine(lines, /SELECT\s+.*\+|query\s*\([^)]*\+|execute\s*\([^)]*\+/i));
    addSuggestion("Security", "Use parameterized queries", "Pass user values as bound parameters instead of concatenating them into SQL strings.");
  }

  if (/\b(console\.log|print|System\.out\.print)/.test(code)) {
    addIssue("info", "Debug output is present.", findLine(lines, /\b(console\.log|print|System\.out\.print)/));
    addSuggestion("Maintainability", "Use intentional logging", "Remove temporary prints or replace them with a proper logger when the output is required.");
  }

  if (cyclomaticComplexity > 10) {
    addIssue("warning", `Cyclomatic complexity is ${cyclomaticComplexity}, which makes testing and maintenance harder.`, findLine(lines, /\b(if|for|while|case|catch|except|switch)\b/));
    addSuggestion("Maintainability", "Split complex logic", "Extract smaller functions for validation, transformation, and output decisions.");
  }

  if (nestingDepth >= 5) {
    addIssue("warning", "Deep nesting makes the control flow harder to follow.", findLine(lines, /^\s{10,}\S/));
    addSuggestion("Readability", "Reduce nesting", "Use guard clauses and helper functions to keep the main path easier to scan.");
  }

  if (longLineCount > 0) {
    addIssue("info", `${longLineCount} line${longLineCount > 1 ? "s are" : " is"} longer than 110 characters.`, findLine(lines, /^.{111,}$/));
    addSuggestion("Readability", "Wrap long statements", "Break long expressions or argument lists into multiple lines for easier review.");
  }

  if (duplicateLineCount > 1) {
    addIssue("warning", "Repeated code patterns detected.", 0);
    addSuggestion("Maintainability", "Extract repeated logic", "Move duplicated statements into a named helper so future changes happen in one place.");
  }

  if (hasRecursiveCall(code)) {
    addIssue("warning", "Recursive logic can become expensive without clear base cases or caching.", 1);
    addSuggestion("Performance", "Review recursive cost", "Add memoization, use iteration, or document input limits when recursion can grow quickly.");
  }

  if (/\b(todo|fixme|hack)\b/i.test(code)) {
    addIssue("info", "Unresolved TODO/FIXME style note found.", findLine(lines, /\b(todo|fixme|hack)\b/i));
    addSuggestion("Maintainability", "Resolve follow-up notes", "Convert temporary TODOs into tracked tasks or complete them before submission.");
  }

  if (nonEmptyLines > 0) strengths.push("Code is present and reviewable.");
  if (cyclomaticComplexity <= 6) strengths.push("Control flow is simple enough to test comfortably.");
  if (duplicateLineCount === 0) strengths.push("No obvious line-level duplication was detected.");
  if (commentLines > 0) strengths.push("The code includes some explanatory comments.");
  if (!issues.some((issue) => issue.severity === "critical")) strengths.push("No high-risk security issue was detected by the local scanner.");

  const critical = issues.filter((issue) => issue.severity === "critical").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  const infos = issues.filter((issue) => issue.severity === "info").length;

  const complexityScore = clamp(100 - Math.max(0, cyclomaticComplexity - 1) * 6 - Math.max(0, nestingDepth - 3) * 7, 35, 100);
  const readabilityScore = clamp(92 - longLineCount * 4 - warnings * 3 - (commentLines === 0 && nonEmptyLines > 20 ? 5 : 0), 40, 100);
  const duplicationScore = clamp(100 - duplicateLineCount * 9, 45, 100);
  const maintainabilityScore = clamp(92 - warnings * 8 - critical * 18 - infos * 2, 25, 100);
  let overallScore = clamp(
    complexityScore * 0.25 + readabilityScore * 0.25 + duplicationScore * 0.2 + maintainabilityScore * 0.3,
    0,
    100
  );
  if (critical > 0) overallScore = Math.min(overallScore, 62);

  const issuePhrase = critical
    ? `${critical} critical issue${critical > 1 ? "s" : ""}`
    : warnings
      ? `${warnings} warning${warnings > 1 ? "s" : ""}`
      : infos
        ? `${infos} minor note${infos > 1 ? "s" : ""}`
        : "no major issues";

  return {
    overallScore,
    complexityScore,
    readabilityScore,
    duplicationScore,
    maintainabilityScore,
    linesOfCode: nonEmptyLines,
    cyclomaticComplexity,
    issues: uniqueByMessage(issues),
    suggestions: uniqueByMessage(suggestions).slice(0, 8),
    summary: `Reviewed ${nonEmptyLines} lines of ${language} code and found ${issuePhrase}. Focus next on security, complexity, and maintainability improvements with the highest-impact items listed below.`,
    strengths: strengths.slice(0, 4),
    grade: gradeFromScore(overallScore),
  };
}

exports.analyze = async (req, res, next) => {
  try {
    const { code, language = "JavaScript" } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Code is required" });
    }

    const prompt = `You are CodeInsight, an expert code review AI. Analyze the following ${language} code and return ONLY a valid JSON object with this structure:

{
  "overallScore": <integer 0-100>,
  "complexityScore": <integer 0-100>,
  "readabilityScore": <integer 0-100>,
  "duplicationScore": <integer 0-100>,
  "maintainabilityScore": <integer 0-100>,
  "linesOfCode": <integer>,
  "cyclomaticComplexity": <integer>,
  "issues": [
    { "severity": "critical|warning|info", "message": "<short description>", "line": <int or 0> }
  ],
  "suggestions": [
    { "category": "Performance|Readability|Security|Maintainability|Best Practice", "title": "<short title>", "description": "<2 sentence actionable advice>" }
  ],
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "grade": "A+|A|B+|B|C+|C|D|F"
}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

    let report;
    try {
      report = await getAnthropicReport(prompt);
    } catch (apiError) {
      console.warn("Using local analysis:", apiError.message);
      report = buildLocalReport(code, language);
    }

    const stmt = db.prepare(`
      INSERT INTO submissions
        (user_id, language, code, overall_score, complexity_score, readability_score,
         duplication_score, maintainability_score, cyclomatic_complexity, lines_of_code,
         grade, summary, issues, suggestions, strengths)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      DEMO_USER_ID,
      language,
      code,
      report.overallScore,
      report.complexityScore,
      report.readabilityScore,
      report.duplicationScore,
      report.maintainabilityScore,
      report.cyclomaticComplexity,
      report.linesOfCode,
      report.grade,
      report.summary,
      JSON.stringify(report.issues || []),
      JSON.stringify(report.suggestions || []),
      JSON.stringify(report.strengths || [])
    );

    res.json({ id: result.lastInsertRowid, ...report, language });
  } catch (err) {
    next(err);
  }
};

exports.getSubmissions = (req, res, next) => {
  try {
    const rows = db
      .prepare(
        `SELECT id, language, overall_score, complexity_score, readability_score,
                duplication_score, maintainability_score, cyclomatic_complexity,
                lines_of_code, grade, summary, issues, suggestions, strengths, created_at
         FROM submissions WHERE user_id = ? ORDER BY created_at DESC`
      )
      .all(DEMO_USER_ID);

    const submissions = rows.map((row) => ({
      ...row,
      issues: JSON.parse(row.issues || "[]"),
      suggestions: JSON.parse(row.suggestions || "[]"),
      strengths: JSON.parse(row.strengths || "[]"),
    }));

    res.json(submissions);
  } catch (err) {
    next(err);
  }
};

exports.getSubmission = (req, res, next) => {
  try {
    const row = db
      .prepare(`SELECT * FROM submissions WHERE id = ? AND user_id = ?`)
      .get(req.params.id, DEMO_USER_ID);

    if (!row) return res.status(404).json({ error: "Submission not found" });

    res.json({
      ...row,
      issues: JSON.parse(row.issues || "[]"),
      suggestions: JSON.parse(row.suggestions || "[]"),
      strengths: JSON.parse(row.strengths || "[]"),
    });
  } catch (err) {
    next(err);
  }
};

exports.clearSubmissions = (req, res, next) => {
  try {
    db.prepare("DELETE FROM submissions WHERE user_id = ?").run(DEMO_USER_ID);
    res.json({ message: "All submissions cleared" });
  } catch (err) {
    next(err);
  }
};
