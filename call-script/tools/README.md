# Regenerating the printed call-flow sheet

The sheet is generated from `src/data/flow.ts`, not typed out, so it cannot drift from what
reps see on screen. Rerun it after any script change.

```
cd call-script
cat > __dump.ts <<'TS'
import { flow, QUICK_OBJECTIONS, DEEP_OBJECTIONS, SALARY_TABLE, SAVINGS_CLAIM, SAVINGS_PCT, MEETING_LENGTH } from './src/data/flow'
import { GATE_COPY, GATE_TITLES, SPOKEN_GATE_ORDER } from './src/data/gates'
const MAIN = ['opening','pitch_q1','qualify_role','value_offer','qualify_fulltime','qualify_volume','qualify_offshore','qualify_timeline','qualify_dm','qualify_budget','two_meeting','close_recap','close_authority','end_booked']
const all = Object.keys(flow)
console.log(JSON.stringify({
  consts: { SAVINGS_CLAIM, SAVINGS_PCT, MEETING_LENGTH }, main: MAIN,
  quick: QUICK_OBJECTIONS, deep: DEEP_OBJECTIONS,
  objectionNodes: all.filter(k => (flow as any)[k]?.isObjection),
  otherNodes: all.filter(k => !MAIN.includes(k) && !(flow as any)[k]?.isObjection),
  nodes: Object.fromEntries(all.map(k => { const n = (flow as any)[k]
    return [k, { title: n.title, script: n.script, tip: n.tip, isObjection: !!n.isObjection,
      isEnd: !!n.isEnd, records: n.recordField?.label,
      options: (n.options ?? []).map((o: any) => ({ label: o.label, next: o.next, type: o.type })) }] })),
  gates: { SPOKEN_GATE_ORDER, GATE_TITLES, GATE_COPY }, salary: SALARY_TABLE,
}, null, 1))
TS
npx esbuild __dump.ts --bundle --format=esm --platform=node --outfile=dump.mjs --log-level=error
node dump.mjs > flow.json && rm __dump.ts dump.mjs

python tools/build-flow-sheet.py flow.json Call-Flow-Full.html
chrome --headless --no-pdf-header-footer --print-to-pdf=Call-Flow-Full.pdf Call-Flow-Full.html
```

MAIN is the step order from `src/components/CallScreen.tsx`. If a step is added there, add it
here too, otherwise it lands in Part Six with the other endings rather than in the numbered
flow.
