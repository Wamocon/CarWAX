# Claude Code Master Configuration
# Harness Engineering System (Boris Cherny + Garry Tan Methodology)

## Core Philosophy

This configuration implements Boris Cherny's "loop engineering" and Garry Tan's "gstack" methodology for autonomous, high-quality software development.

**Key Principle**: "I don't prompt Claude anymore. I have loops running that prompt Claude and figure out what to do. My job is to write loops." - Boris Cherny

---

## Harness Engineering Rules

### 1. Verification Closes the Loop
- ALWAYS verify work before marking complete
- Use tests for backend, browser testing for frontend, simulators for mobile
- Iterate based on feedback - this improves quality 2-3x
- Never skip verification even for "simple" changes

### 2. Plan Mode First for Complex Work
- Enter Plan mode (shift+tab twice) for multi-step tasks
- Iterate on the plan until solid before implementation
- Poor planning upstream = problems downstream
- Use `/autoplan` for automated CEO -> Design -> Eng review

### 3. Parallel Execution
- Run multiple Claude sessions in separate git worktrees when possible
- Use `git worktree add ../feature-name branch-name` for isolation
- Maximize concurrent work: different features, testing, review, debugging

### 4. Skills Over Manual Prompting
- Anything done more than once becomes a skill or command
- Use the installed skills: `/ship`, `/review`, `/qa`, `/design-review`
- Check available skills with `/gstack` router

### 5. Compounding Engineering via CLAUDE.md
- After every mistake, add correction rules here
- Claude is good at writing rules for itself
- Tag @.claude in PR reviews to auto-add learnings

---

## Installed Skills Reference

### GStack (Garry Tan) - 55 skills
| Skill | Purpose |
|-------|---------|
| `/autoplan` | Auto-run CEO -> Design -> Eng reviews |
| `/ship` | Test, audit, PR workflow |
| `/review` | Staff engineer code audit |
| `/qa` | QA testing with atomic commits |
| `/design-review` | Live design audit with screenshots |
| `/design-consultation` | Build design systems from scratch |
| `/design-html` | Convert mockups to production HTML/CSS |
| `/cso` | OWASP + STRIDE security audit |
| `/browse` | Real Chromium browser automation |
| `/investigate` | Systematic root-cause debugging |
| `/context-save` / `/context-restore` | Session checkpoints |

### Impeccable - 23 commands
| Command | Purpose |
|---------|---------|
| `/impeccable` | Main design quality layer |
| `/impeccable init` | Setup PRODUCT.md and DESIGN.md |
| `polish` | Refine UI details |
| `audit` | Design audit |
| `critique` | Critical design review |
| `animate` | Add animations |
| `bolder` / `quieter` | Adjust design intensity |

### Emil Kowalski Design Engineering
| Skill | Purpose |
|-------|---------|
| `emil-design-eng` | UI polish, component design, animation |
| `animation-vocabulary` | Vague descriptions -> exact terms |
| `review-animations` | Review motion against high craft bar |

### ClaudeDesignSkills (3D/Animation)
| Skill | Purpose |
|-------|---------|
| `threejs-webgl` | Three.js 3D graphics |
| `gsap-scrolltrigger` | GSAP + scroll animations |
| `framer-motion` | React motion library |
| `react-three-fiber` | React Three Fiber 3D |
| `web3d-integration` | Multi-library integration |

### UI UX Pro Max (Design Intelligence)
| Feature | Details |
|---------|---------|
| UI Styles | 67 searchable styles |
| Color Palettes | 161 industry-specific palettes |
| Font Pairings | 57 typography combinations |
| Chart Types | 25 data visualization types |
| UX Guidelines | 99 best practices |
| Frameworks | React, Next.js, Vue, Astro, HTML/CSS |
| Stacks | 21 supported (shadcn/ui, Tailwind, SwiftUI, Flutter, etc.) |

**Auto-triggers on**: UI/UX work, design systems, color schemes, typography, layouts, accessibility, animations, data viz

---

## Animation & Motion Rules (Emil Kowalski)

### Core Rules
1. UI animations MUST be under 300ms
2. Use custom easing curves, NEVER CSS defaults like `ease-in`
3. Disable animations for actions repeated >100 times daily
4. Prefer `transform` and `opacity` - avoid layout properties
5. Use ONE motion language across the artifact
6. Always provide `prefers-reduced-motion` fallbacks

### Verification
- Review animations against before/after tables
- Check for common mistakes: wrong easing, animating layout
- Ensure consistent timing across the application

---

## Quality Gates

### Before Any PR
1. Run `/review` - Staff engineer audit
2. Run `/design-review` - Design quality check
3. Run `/qa` - QA testing
4. Run `/cso` - Security audit (for sensitive changes)

### For UI/UX Work
1. Use `/impeccable audit` first
2. Check animations with `review-animations`
3. Verify responsive behavior
4. Test reduced-motion

---

## Session Management

### Context Optimization
- Auto-compact threshold: 400k tokens
- Use `/context-save` before long breaks
- Use `/context-restore` to resume
- Rewind (`/rewind`) over correction to avoid polluting context

### Parallel Sessions
```bash
# Create isolated worktrees
git worktree add ../feature-auth auth-branch
git worktree add ../feature-ui ui-branch
git worktree add ../feature-api api-branch
```

---

## AI Adoption Levels (Boris Cherny Framework)

| Level | Multiplier | Description |
|-------|------------|-------------|
| Gated | 0 | Manual approval for everything |
| Assisted | ~1x | AI helps, human drives |
| Parallel | ~10x | Multiple concurrent sessions |
| Supervised Autonomy | ~100x | AI works, human monitors |
| AI-Native | ~1000x | Loops prompt loops |

**Goal**: Reach Supervised Autonomy (100x) through this configuration.

---

## Auto-Applied Skills

The following skills are automatically available in every session:
- GStack (all 55 skills)
- Impeccable (23 commands)
- Emil Kowalski Design Engineering (3 skills)
- ClaudeDesignSkills (16+ skills for Three.js, GSAP, Motion, etc.)
- Taste Skill (anti-slop frontend)
- **UI UX Pro Max** (67 styles, 161 palettes, 57 fonts, 25 charts, 99 UX guidelines)

---

## Learning Log

Add learnings here after mistakes:

```
<!-- Template:
### [DATE] - Learning Title
**Problem**: What went wrong
**Rule**: The rule to prevent this
**Applies to**: [frontend|backend|design|testing|all]
-->
```

---

*Configuration based on Garry Tan's GStack and Boris Cherny's harness engineering methodology, July 2026*
