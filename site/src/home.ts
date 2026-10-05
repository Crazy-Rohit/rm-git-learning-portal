const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Line = { kind: 'cmd' | 'out' | 'head'; text: string };

const SESSION: Line[] = [
  { kind: 'cmd', text: 'git init' },
  { kind: 'out', text: 'Initialized empty Git repository in ~/git-lab/.git/' },
  { kind: 'cmd', text: 'echo "*.log" >> .gitignore' },
  { kind: 'cmd', text: 'git add README.md .gitignore' },
  { kind: 'cmd', text: 'git commit -m "Add README and ignore logs"' },
  { kind: 'out', text: '[main 3f9c2ab] Add README and ignore logs\n 2 files changed, 6 insertions(+)' },
  { kind: 'cmd', text: 'git switch -c feature/greeting' },
  { kind: 'out', text: "Switched to a new branch 'feature/greeting'" },
  { kind: 'cmd', text: 'git push -u origin feature/greeting' },
  { kind: 'head', text: 'remote: Create a pull request for feature/greeting' },
  { kind: 'cmd', text: 'git log --oneline --graph' },
  { kind: 'out', text: '* 3f9c2ab (HEAD -> feature/greeting) Add README\n* a749eff (origin/main) Add greeting' },
];

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function span(kind: string, text: string) {
  const node = document.createElement('span');
  node.className = kind;
  node.textContent = text;
  return node;
}

async function runTerminal(target: HTMLElement) {
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  const render = (lines: Line[]) => {
    target.replaceChildren();
    for (const line of lines) {
      if (line.kind === 'cmd') target.append(span('p', '$ '), document.createTextNode(`${line.text}\n`));
      else target.append(span(line.kind === 'head' ? 'h' : 'o', `${line.text}\n`));
    }
  };
  if (reduced) {
    render(SESSION);
    return;
  }
  for (;;) {
    const done: Line[] = [];
    for (const line of SESSION) {
      if (line.kind === 'cmd') {
        for (let i = 1; i <= line.text.length; i += 1) {
          render(done);
          target.append(span('p', '$ '), document.createTextNode(line.text.slice(0, i)), cursor);
          await sleep(28 + Math.random() * 40);
        }
        await sleep(260);
      } else {
        await sleep(180);
      }
      done.push(line);
      render(done);
      target.append(span('p', '$ '), cursor);
      if (done.length > 9) done.shift();
    }
    await sleep(2600);
  }
}

function countUp(node: HTMLElement) {
  const end = Number(node.dataset.count || 0);
  const prefix = node.dataset.prefix || '';
  if (reduced || end === 0) {
    node.textContent = `${prefix}${end}`;
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 1100);
    node.textContent = `${prefix}${Math.round(end * (1 - (1 - t) ** 3))}`;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function buildContrib(grid: HTMLElement) {
  const room = (grid.parentElement?.clientWidth ?? 800) - 40;
  const weeks = Math.max(16, Math.min(53, Math.floor((room + 3) / 15)));
  const cells: HTMLElement[] = [];
  for (let i = 0; i < weeks * 7; i += 1) {
    const cell = document.createElement('i');
    cells.push(cell);
    grid.append(cell);
  }
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const levels = cells.map((_, index) => {
    const week = Math.floor(index / 7);
    const growth = week / weeks;
    const roll = random() * (0.35 + growth);
    if (roll < 0.35) return 0;
    if (roll < 0.6) return 1;
    if (roll < 0.85) return 2;
    if (roll < 1.1) return 3;
    return 4;
  });
  const paint = () => {
    cells.forEach((cell, index) => {
      if (!levels[index]) return;
      const week = Math.floor(index / 7);
      const delay = reduced ? 0 : week * 22 + (index % 7) * 8;
      window.setTimeout(() => cell.setAttribute('data-l', String(levels[index])), delay);
    });
  };
  return paint;
}

const terminal = document.querySelector<HTMLElement>('#term');
if (terminal) void runTerminal(terminal);

const contrib = document.querySelector<HTMLElement>('#contrib');
const paintContrib = contrib ? buildContrib(contrib) : null;
const graph = document.querySelector<SVGSVGElement>('#graph');
const timeline = document.querySelector<HTMLElement>('#timeline');

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const node = entry.target as HTMLElement;
    node.classList.add('in');
    node.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    if (node.contains(contrib) && paintContrib) paintContrib();
    observer.unobserve(node);
  }
}, { threshold: 0.18 });

document.querySelectorAll<HTMLElement>('.reveal').forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  observer.observe(node);
});

if (graph) {
  const graphObserver = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return;
    graph.classList.add('in');
    timeline?.style.setProperty('--fill', '0.08');
    graphObserver.disconnect();
  }, { threshold: 0.3 });
  graphObserver.observe(graph);
}
