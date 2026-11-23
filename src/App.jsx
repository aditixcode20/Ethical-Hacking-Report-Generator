import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Download,
  Printer,
  X,
  FileText,
} from "lucide-react";

const SEVERITIES = [
  { key: "critical", label: "Critical", color: "#c2413b" },
  { key: "high", label: "High", color: "#c87932" },
  { key: "medium", label: "Medium", color: "#b59a35" },
  { key: "low", label: "Low", color: "#4d82a8" },
  { key: "info", label: "Info", color: "#7b8790" },
];

const emptyFinding = {
  title: "",
  severity: "medium",
  cvss: "",
  systems: "",
  description: "",
  evidence: "",
  remediation: "",
};

const sampleFinding = {
  id: "sample-1",
  title: "Reflected Cross-Site Scripting",
  severity: "high",
  cvss: "7.4",
  systems: "/search?q=",
  description:
    "The search parameter is reflected in the response without proper output encoding.",
  evidence:
    "GET /search?q=<script>alert(1)</script>\nThe payload was reflected without encoding.",
  remediation:
    "Apply context-aware output encoding and use a suitable Content-Security-Policy.",
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [engagement, setEngagement] = useState({
    client: "Targetcorp Industries",
    name: "Web Application Security Assessment",
    tester: "",
    startDate: getToday(),
    endDate: getToday(),
    scope: "Application login, search and user-management modules",
  });

  const [findings, setFindings] = useState([sampleFinding]);
  const [draft, setDraft] = useState(emptyFinding);
  const [editingId, setEditingId] = useState(null);
  const [summary, setSummary] = useState("");

  const counts = useMemo(() => {
    const result = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    findings.forEach((finding) => {
      result[finding.severity]++;
    });

    return result;
  }, [findings]);

  const sortedFindings = useMemo(() => {
    return [...findings].sort(
      (a, b) =>
        SEVERITIES.findIndex((s) => s.key === a.severity) -
        SEVERITIES.findIndex((s) => s.key === b.severity)
    );
  }, [findings]);

  const generatedSummary = useMemo(() => {
    if (findings.length === 0) {
      return "No security findings have been recorded for this assessment.";
    }

    const highRisk = counts.critical + counts.high;

    return `This assessment identified ${
      findings.length
    } security finding(s) within the defined scope. ${
      highRisk > 0
        ? "Critical and high-severity findings should be reviewed before production deployment."
        : "No critical or high-severity findings were recorded."
    }`;
  }, [findings, counts]);

  const displayedSummary = summary.trim() || generatedSummary;

  function updateEngagement(field, value) {
    setEngagement((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateDraft(field, value) {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetDraft() {
    setDraft(emptyFinding);
    setEditingId(null);
  }

  function saveFinding() {
    if (!draft.title.trim()) {
      alert("Please enter a finding title.");
      return;
    }

    if (editingId) {
      setFindings((previous) =>
        previous.map((finding) =>
          finding.id === editingId
            ? { ...draft, id: editingId }
            : finding
        )
      );
    } else {
      setFindings((previous) => [
        ...previous,
        {
          ...draft,
          id: `finding-${Date.now()}`,
        },
      ]);
    }

    resetDraft();
  }

  function editFinding(finding) {
    setDraft({ ...finding });
    setEditingId(finding.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteFinding(id) {
    setFindings((previous) =>
      previous.filter((finding) => finding.id !== id)
    );

    if (editingId === id) {
      resetDraft();
    }
  }

  function exportMarkdown() {
    const lines = [
      `# ${engagement.name || "Security Assessment Report"}`,
      "",
      `**Client:** ${engagement.client || "—"}`,
      `**Tester:** ${engagement.tester || "—"}`,
      `**Dates:** ${engagement.startDate} to ${engagement.endDate}`,
      `**Scope:** ${engagement.scope || "—"}`,
      "",
      "## Executive Summary",
      "",
      displayedSummary,
      "",
      "## Risk Overview",
      "",
      "| Severity | Count |",
      "|---|---:|",
      ...SEVERITIES.map(
        (severity) => `| ${severity.label} | ${counts[severity.key]} |`
      ),
      "",
      "## Findings",
      "",
    ];

    sortedFindings.forEach((finding, index) => {
      lines.push(`### ${index + 1}. ${finding.title}`);
      lines.push("");
      lines.push(`**Severity:** ${finding.severity}`);
      lines.push(`**CVSS:** ${finding.cvss || "—"}`);
      lines.push(`**Affected systems:** ${finding.systems || "—"}`);
      lines.push("");
      lines.push("**Description**");
      lines.push(finding.description || "—");
      lines.push("");
      lines.push("**Evidence**");
      lines.push("```text");
      lines.push(finding.evidence || "—");
      lines.push("```");
      lines.push("");
      lines.push("**Remediation**");
      lines.push(finding.remediation || "—");
      lines.push("");
    });

    const file = new Blob([lines.join("\n")], {
      type: "text/markdown",
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "security-assessment-report.md";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #eeeae3;
          font-family: "DM Sans", sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        .app {
          min-height: 100vh;
          color: #27333b;
          background: #eeeae3;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          padding: 18px 30px;
          background: #fffdf9;
          border-bottom: 1px solid #d8d2c8;
          flex-wrap: wrap;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          background: #263f4b;
          color: #f2c477;
          border-radius: 8px;
        }

        .brand-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #263f4b;
        }

        .brand-subtitle {
          font-size: 11px;
          color: #8b8175;
          margin-top: 3px;
        }

        .top-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #d2d7d9;
          background: white;
          color: #34454e;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .button:hover {
          background: #f7f1e7;
          border-color: #b8a17e;
        }

        .button.primary {
          background: #263f4b;
          color: white;
          border-color: #263f4b;
        }

        .button.primary:hover {
          background: #345665;
        }

        .layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          min-height: calc(100vh - 76px);
        }

        .editor {
          background: #1d2b35;
          padding: 25px;
          color: white;
        }

        .section {
          background: #263943;
          border: 1px solid #40515b;
          border-radius: 9px;
          padding: 18px;
          margin-bottom: 18px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f2c477;
          font-family: "Space Grotesk", sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .08em;
          margin-bottom: 17px;
        }

        .field {
          margin-bottom: 13px;
        }

        .field label {
          display: block;
          color: #b8c4ca;
          font-size: 11px;
          margin-bottom: 6px;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid #50616c;
          border-radius: 5px;
          background: #14212a;
          color: #f4f6f7;
          padding: 10px 11px;
          outline: none;
          font-size: 12px;
        }

        .field textarea {
          resize: vertical;
          min-height: 75px;
          line-height: 1.5;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #e4b66d;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .severity-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .severity-button {
          border: 1px solid #53646e;
          background: #14212a;
          color: #b8c4ca;
          border-radius: 5px;
          padding: 8px 10px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
        }

        .severity-button.active {
          background: #f2c477;
          color: #24343d;
          border-color: #f2c477;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          margin-top: 15px;
        }

        .form-actions .button {
          flex: 1;
        }

        .finding-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px;
          border: 1px solid #435660;
          border-radius: 6px;
          background: #20313b;
          margin-bottom: 8px;
        }

        .severity-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .finding-name {
          flex: 1;
          min-width: 0;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .small-actions {
          display: flex;
          gap: 4px;
        }

        .icon-button {
          display: grid;
          place-items: center;
          border: 1px solid transparent;
          background: transparent;
          color: #b8c4ca;
          padding: 6px;
          border-radius: 5px;
          cursor: pointer;
        }

        .icon-button:hover {
          color: #f2c477;
          background: #304650;
        }

        .preview-area {
          padding: 34px;
          background: #e4e0d8;
          overflow: auto;
        }

        .paper {
          max-width: 850px;
          margin: auto;
          background: #fffdf8;
          border: 1px solid #d8d0c4;
          padding: 58px 64px;
          box-shadow: 0 7px 22px rgba(35, 43, 48, .08);
          position: relative;
        }

        .paper::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 7px;
          background: #263f4b;
        }

        .paper-kicker {
          font-size: 10px;
          letter-spacing: .12em;
          color: #9b8060;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .paper h1 {
          font-family: "Space Grotesk", sans-serif;
          color: #263f4b;
          font-size: 34px;
          line-height: 1.15;
          margin: 0 0 26px;
        }

        .metadata {
          border-top: 1px solid #ddd6cb;
          padding-top: 14px;
        }

        .metadata-row {
          display: flex;
          gap: 18px;
          padding: 6px 0;
          font-size: 13px;
        }

        .metadata-key {
          width: 145px;
          color: #9b8060;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .07em;
        }

        .metadata-value {
          flex: 1;
        }

        .paper hr {
          border: 0;
          border-top: 1px solid #ddd6cb;
          margin: 38px 0 27px;
        }

        .paper h2 {
          font-family: "Space Grotesk", sans-serif;
          color: #263f4b;
          font-size: 21px;
          margin: 0 0 13px;
        }

        .paper p {
          color: #52616a;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        .risk-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 9px 0;
        }

        .risk-label {
          width: 100px;
          color: #8f806d;
          font-size: 11px;
        }

        .risk-track {
          flex: 1;
          height: 9px;
          background: #e8e1d7;
          border-radius: 2px;
          overflow: hidden;
        }

        .risk-fill {
          height: 100%;
        }

        .risk-count {
          width: 20px;
          text-align: right;
          color: #263f4b;
          font-size: 12px;
          font-weight: 700;
        }

        .finding-preview {
          border-bottom: 1px dashed #d8d0c4;
          padding-bottom: 25px;
          margin-bottom: 30px;
        }

        .finding-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .finding-number {
          color: #a99a87;
          font-size: 12px;
          font-weight: 700;
        }

        .finding-heading h3 {
          margin: 0;
          font-family: "Space Grotesk", sans-serif;
          font-size: 18px;
          color: #26343d;
        }

        .badge {
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .05em;
        }

        .finding-system {
          color: #9b8060;
          font-size: 11px;
          margin-bottom: 15px;
        }

        .content-label {
          color: #9b8060;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .09em;
          margin: 16px 0 7px;
        }

        .evidence {
          background: #263943;
          color: #edf2f3;
          border-radius: 3px;
          padding: 15px;
          font-family: monospace;
          font-size: 11px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        @media (max-width: 1050px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .editor,
          .preview-area {
            max-height: none;
          }

          .paper {
            padding: 38px 28px;
          }
        }

        @media (max-width: 600px) {
          .topbar {
            padding: 16px;
          }

          .editor,
          .preview-area {
            padding: 16px;
          }

          .two-columns {
            grid-template-columns: 1fr;
          }

          .metadata-row {
            flex-direction: column;
            gap: 4px;
          }

          .metadata-key {
            width: auto;
          }

          .paper h1 {
            font-size: 28px;
          }
        }

        @media print {
          .topbar,
          .editor {
            display: none !important;
          }

          .layout {
            display: block;
          }

          .preview-area {
            padding: 0;
            background: white;
          }

          .paper {
            max-width: 100%;
            border: 0;
            box-shadow: none;
          }

          .paper::before {
            display: none;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <div className="brand-title">Security Notes</div>
            <div className="brand-subtitle">
              Ethical hacking assessment workspace
            </div>
          </div>
        </div>

        <div className="top-actions">
          <button className="button" onClick={exportMarkdown}>
            <Download size={15} />
            Export Markdown
          </button>

          <button className="button primary" onClick={() => window.print()}>
            <Printer size={15} />
            Print / Save PDF
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="editor">
          <section className="section">
            <div className="section-title">
              <FileText size={15} />
              Assessment details
            </div>

            <div className="field">
              <label>Client name</label>
              <input
                value={engagement.client}
                onChange={(e) =>
                  updateEngagement("client", e.target.value)
                }
                placeholder="Enter client name"
              />
            </div>

            <div className="field">
              <label>Assessment title</label>
              <input
                value={engagement.name}
                onChange={(e) =>
                  updateEngagement("name", e.target.value)
                }
                placeholder="Enter assessment title"
              />
            </div>

            <div className="field">
              <label>Tester</label>
              <input
                value={engagement.tester}
                onChange={(e) =>
                  updateEngagement("tester", e.target.value)
                }
                placeholder="Your name"
              />
            </div>

            <div className="two-columns">
              <div className="field">
                <label>Start date</label>
                <input
                  type="date"
                  value={engagement.startDate}
                  onChange={(e) =>
                    updateEngagement("startDate", e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>End date</label>
                <input
                  type="date"
                  value={engagement.endDate}
                  onChange={(e) =>
                    updateEngagement("endDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="field">
              <label>Scope</label>
              <textarea
                value={engagement.scope}
                onChange={(e) =>
                  updateEngagement("scope", e.target.value)
                }
                placeholder="Enter assessment scope"
              />
            </div>
          </section>

          <section className="section">
            <div className="section-title">
              <Plus size={15} />
              {editingId ? "Edit finding" : "Add finding"}
            </div>

            <div className="field">
              <label>Finding title</label>
              <input
                value={draft.title}
                onChange={(e) => updateDraft("title", e.target.value)}
                placeholder="Example: SQL Injection"
              />
            </div>

            <div className="field">
              <label>Severity</label>

              <div className="severity-list">
                {SEVERITIES.map((severity) => (
                  <button
                    key={severity.key}
                    className={`severity-button ${
                      draft.severity === severity.key ? "active" : ""
                    }`}
                    onClick={() =>
                      updateDraft("severity", severity.key)
                    }
                  >
                    {severity.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="two-columns">
              <div className="field">
                <label>CVSS score</label>
                <input
                  value={draft.cvss}
                  onChange={(e) => updateDraft("cvss", e.target.value)}
                  placeholder="7.5"
                />
              </div>

              <div className="field">
                <label>Affected system</label>
                <input
                  value={draft.systems}
                  onChange={(e) =>
                    updateDraft("systems", e.target.value)
                  }
                  placeholder="/login"
                />
              </div>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                value={draft.description}
                onChange={(e) =>
                  updateDraft("description", e.target.value)
                }
                placeholder="Explain the vulnerability"
              />
            </div>

            <div className="field">
              <label>Evidence</label>
              <textarea
                value={draft.evidence}
                onChange={(e) =>
                  updateDraft("evidence", e.target.value)
                }
                placeholder="Add request, response or observation"
              />
            </div>

            <div className="field">
              <label>Remediation</label>
              <textarea
                value={draft.remediation}
                onChange={(e) =>
                  updateDraft("remediation", e.target.value)
                }
                placeholder="Explain how to fix it"
              />
            </div>

            <div className="form-actions">
              <button className="button primary" onClick={saveFinding}>
                {editingId ? "Update finding" : "Add finding"}
              </button>

              {editingId && (
                <button className="button" onClick={resetDraft}>
                  <X size={14} />
                  Cancel
                </button>
              )}
            </div>
          </section>

          <section className="section">
            <div className="section-title">
              <FileText size={15} />
              Recorded findings ({findings.length})
            </div>

            {findings.length === 0 && (
              <p style={{ color: "#b8c4ca", fontSize: 12 }}>
                No findings added yet.
              </p>
            )}

            {sortedFindings.map((finding) => {
              const severity = SEVERITIES.find(
                (item) => item.key === finding.severity
              );

              return (
                <div className="finding-item" key={finding.id}>
                  <span
                    className="severity-dot"
                    style={{ background: severity.color }}
                  />

                  <span className="finding-name">
                    {finding.title}
                  </span>

                  <div className="small-actions">
                    <button
                      className="icon-button"
                      onClick={() => editFinding(finding)}
                      title="Edit finding"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      className="icon-button"
                      onClick={() => deleteFinding(finding.id)}
                      title="Delete finding"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        </aside>

        <section className="preview-area">
          <article className="paper">
            <div className="paper-kicker">
              CONFIDENTIAL — SECURITY ASSESSMENT REPORT
            </div>

            <h1>{engagement.name || "Security Assessment Report"}</h1>

            <div className="metadata">
              <div className="metadata-row">
                <div className="metadata-key">CLIENT</div>
                <div className="metadata-value">
                  {engagement.client || "—"}
                </div>
              </div>

              <div className="metadata-row">
                <div className="metadata-key">TESTER</div>
                <div className="metadata-value">
                  {engagement.tester || "—"}
                </div>
              </div>

              <div className="metadata-row">
                <div className="metadata-key">DATES</div>
                <div className="metadata-value">
                  {engagement.startDate} — {engagement.endDate}
                </div>
              </div>

              <div className="metadata-row">
                <div className="metadata-key">SCOPE</div>
                <div className="metadata-value">
                  {engagement.scope || "—"}
                </div>
              </div>
            </div>

            <hr />

            <h2>Executive Summary</h2>

            <p>{displayedSummary}</p>

            <div className="field">
              <label style={{ color: "#9b8060" }}>
                Custom summary — optional
              </label>

              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write your own executive summary..."
                style={{
                  color: "#27333b",
                  background: "#fff",
                  borderColor: "#d8d0c4",
                  minHeight: 90,
                }}
              />
            </div>

            <h2>Risk Overview</h2>

            <div>
              {SEVERITIES.map((severity) => (
                <div className="risk-row" key={severity.key}>
                  <div className="risk-label">{severity.label}</div>

                  <div className="risk-track">
                    <div
                      className="risk-fill"
                      style={{
                        width: `${
                          Math.max(
                            0,
                            (counts[severity.key] /
                              Math.max(1, findings.length)) *
                              100
                          )
                        }%`,
                        background: severity.color,
                      }}
                    />
                  </div>

                  <div className="risk-count">
                    {counts[severity.key]}
                  </div>
                </div>
              ))}
            </div>

            <hr />

            <h2>Findings</h2>

            {sortedFindings.length === 0 && (
              <p>No findings have been recorded.</p>
            )}

            {sortedFindings.map((finding, index) => {
              const severity = SEVERITIES.find(
                (item) => item.key === finding.severity
              );

              return (
                <div className="finding-preview" key={finding.id}>
                  <div className="finding-heading">
                    <span className="finding-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3>{finding.title || "Untitled finding"}</h3>

                    <span
                      className="badge"
                      style={{ background: severity.color }}
                    >
                      {severity.label.toUpperCase()}
                    </span>

                    {finding.cvss && (
                      <span style={{ fontSize: 11, color: "#9b8060" }}>
                        CVSS {finding.cvss}
                      </span>
                    )}
                  </div>

                  <div className="finding-system">
                    {finding.systems || "Affected system not specified"}
                  </div>

                  <div className="content-label">Description</div>
                  <p>{finding.description || "—"}</p>

                  <div className="content-label">Evidence</div>
                  <div className="evidence">
                    {finding.evidence || "—"}
                  </div>

                  <div className="content-label">Remediation</div>
                  <p>{finding.remediation || "—"}</p>
                </div>
              );
            })}
          </article>
        </section>
      </main>
    </div>
  );
}
