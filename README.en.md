Versión en español: [README.md](README.md)

# Accounting with AI agents

Four AI agents turn invoices, payslips and bank statements into proposed accounting entries under the Spanish
chart of accounts. A person reviews each entry before it is recorded. This repository shows how its quality was
measured: the test set, the grader and the report from each measurement.

**Result:** in the June 2026 measurement, over 128 documents, the system was right in 97.7 % of cases about
whether to record the entry or stop it for review. It let no wrong entry through. Overall score, 93.3 out of
100.

![Score over 23 measurements, May to July 2026](assets/curva_runs.png)

Project page: [jleonceo.github.io/accounting-agent-swarm](https://jleonceo.github.io/accounting-agent-swarm)

## How it works

```
document (.pdf/.txt) → EXTRACTOR → data → GENERATOR → entry → VALIDATOR → draft or review
bank statement       → MATCHER   → reconciliation against the ledger in MySQL
```

- **Extractor:** reads the document and returns its data. If it cannot be read, it says so.
- **Generator:** proposes the full entry with the company's real accounts.
- **Validator:** checks that it balances and is consistent, and decides whether it goes to draft or stops for
  review.
- **Matcher:** reconciles each line of the bank statement against the ledger.

They are separate agents so that whoever reviews the entry is not whoever proposed it. None of them writes to
the ledger: entries go to a drafts table.

## How it is measured

Each measurement runs the documents through the four agents, and a Python grader compares the output with the
correct answer, written before the measurement. It scores five things: whether the decision to record or stop
was right, whether the entry is exact in accounts and amounts, whether it balances, whether the reason for
stopping was the right one and whether the bank reconciliation matches the database.

The document, the expected entry and the bank movement of each case come from the same record. That way the
test set cannot drift away from the data.

## What comes out

- **June, 128 documents:** right decision in 125, exact entry in 81 of 84, balanced in all, right reason for
  stopping in 33 of 41 and correct reconciliation in 79 of 79. No wrong entry recorded.
- **27 June:** the best score, 94.2.
- **20 July:** with a larger test set, 129 entries and 10 statements, the score drops to 79.4. Two documents were
  recorded when they should have been stopped.
- **The big drops in the curve** (32.1, 35.4 and 57.1) came from faults in the test, not in the system: a grader
  that could not read the validator's output, a run that stopped halfway and expected answers out of step with
  the database.

## What is inside

1. `evidencia/registro_de_runs.md` lists every measurement with its score and cause.
2. `evidencia/` also keeps the grader's June reports, as they came out, and what was left unresolved.
3. `eval/eval_enjambre_fabrica.js` is the program that launched each measurement, with local paths removed.
4. `eval/golden_muestra.json` holds 9 of the 128 test cases, with their correct answer.
5. `index.html`, `styles.css` and `script.js` make up the project page.

## Limits

- It cannot be run from here. The agents work against a private MySQL database and the full test set lives in
  the private project; this repository publishes the measurement, not the system.
- The July score cannot be compared with the earlier ones, because the test set was different and larger.
- The cases still failing are rare ones, such as the purchase option of a lease or an opening entry, and part of
  the failure is model variability.
- In September 2026 the validator was split into two agents, one that reviews without being able to write and
  another that only writes to the drafts table. What is measured here is the four-agent version.
- In `evidencia/`, a false positive means recording a document that should have been stopped, and a false
  negative, stopping one that was fine. That is the reverse of the usual meaning in detection; it is kept so as
  not to break the link with reports already closed.
- The run numbering in this repository does not match the project's internal register. From 21 June runs are
  identified by date.

## Data

The data belongs to TechAcces SL, a fictitious company created for this project. Its ledger for four financial
years lives in a private MySQL database, with synthetic third parties and payroll.

## Related repositories

- [llm-eval-contable](https://github.com/jleonceo/llm-eval-contable): the evaluation of a single accounting skill,
  before the four agents.
- [control-interno-fraude-ia](https://github.com/jleonceo/control-interno-fraude-ia): fraud tests on the general
  ledger.
- [tesoreria-forecast-ia](https://github.com/jleonceo/tesoreria-forecast-ia): cash forecast tested against the
  past, liquidity ratios and ageing.
- [gobernanza-skills-analiticas](https://github.com/jleonceo/gobernanza-skills-analiticas): the rules for
  changing the agents' instructions without breaking what already worked.

---

*Part of [Juan Luis León](https://github.com/jleonceo)'s portfolio · [juanluisleon.vercel.app](https://juanluisleon.vercel.app) · Licence [MIT](LICENSE)*
