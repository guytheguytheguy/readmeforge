# ReadMeForge — Brand Book
<!-- Format: Kynvo Marketing Artifact -->
<!-- Product: ReadMeForge | URL: https://readmeforge.veridux.ai | Brand: Veridux Labs -->
<!-- Last updated: 2026-04-14 -->

---

## Brand Concept

ReadMeForge is built around the metaphor of **forging** — transforming raw material (a codebase) into a finished artifact (a professional README). The forge is hot, fast, and produces something solid. The identity is confident and craftsman-like: this tool ships professional output, not drafts. The visual identity is warmer than other Veridux tools (amber/gold tones over cold cyan) to reflect that documentation is the human-facing side of code — the part that communicates to other people.

---

## Tagline Options

**Option A (Primary)**
> Professional READMEs in seconds. No API costs. No setup.

Direct value prop with two differentiators called out immediately. "No API costs" speaks directly to developers who have been burned by rate limits or hidden charges on AI tools.

**Option B (Transformation-Focused)**
> Paste a GitHub URL. Walk away with a README worth reading.

Emphasizes the before/after. "Worth reading" implies quality rather than just output existence. Good for social content and landing page subheads.

**Option C (Forge Metaphor)**
> Your codebase is the input. A professional README is the output. That's the whole product.

Uncompromising directness. Communicates both simplicity and completeness. Works as a longer-form tagline or hero subheading.

---

## Visual Identity

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background (primary) | Forge Dark | `#0F0E0C` | Page backgrounds — slightly warm black, not pure cold |
| Background (elevated) | Ember Surface | `#161410` | Card backgrounds, elevated panels |
| Background (interactive) | Warm Slate | `#1E1C18` | Hover states, active sidebar items |
| Accent (primary) | Forge Amber | `#F59E0B` | CTAs, highlights, badge previews, active states |
| Accent (secondary) | Warm Gold | `#D97706` | Secondary buttons, link hover states |
| Accent (tertiary) | Deep Copper | `#B45309` | Hover on accent elements, pressed states |
| Badge highlight | Badge Blue | `#60A5FA` | Shield.io badge previews — blue is the dominant badge color |
| Badge highlight (success) | Badge Green | `#4ADE80` | Test pass badges, build success indicators |
| Text (primary) | Parchment White | `#F5F0E8` | Body text, headings — slightly warm white |
| Text (secondary) | Warm Gray | `#A89880` | Captions, metadata, timestamps |
| Text (markdown) | Markdown Tan | `#E8D5B7` | Markdown preview text — warm, document-like |
| Text (code) | Code Amber | `#FCD34D` | Code blocks, inline code, package names |
| Border | Warm Border | `#2C2820` | Card outlines, dividers — warm-toned |
| Success | Forged Green | `#16A34A` | README generated successfully |
| Error | Hot Red | `#DC2626` | Invalid GitHub URL, private repo, fetch error |

### Typography

- **Headings**: `Inter` — clear and modern; avoid serif (this is a dev tool, not a publishing platform)
- **Body**: `Inter` 16px/26px line height — slightly generous line height for a tool that deals with prose
- **Markdown preview**: `Georgia` or `Charter` — renders the generated README in a serif reading font to preview how it will look on GitHub
- **Code / Package names**: `JetBrains Mono` — monospace for commands, install scripts, package names
- **Badge rendering**: Badge images rendered as actual img tags in preview, not described in text

### UI Aesthetic

- **Warmth**: Unlike the cold-black aesthetic of APIGhost or DeployDiff, ReadMeForge uses warm tones. Documentation is a human artifact. The UI should feel like a workshop, not a terminal.
- **Split-pane preview**: Left side: GitHub URL input and options. Right side: live preview of the generated README rendered as it would appear on GitHub (with badges rendering, markdown formatted).
- **Badge strip**: A horizontal row of generated badges displayed above the README preview — visual signal of the quality of output before the user scrolls.
- **Real GitHub rendering**: The preview pane should render markdown exactly as GitHub renders it — heading hierarchy, code blocks, tables, horizontal rules. No stripped-down preview.
- **Generous copy button**: A large, clear "Copy README" button is the primary CTA on the output view. The user's primary action is copying the generated markdown. Make it obvious.
- **History sidebar**: The Supabase-backed history sidebar is warm-toned (Ember Surface background, Forge Amber accent) — feels like a personal workbench of past work.

### Logo Concept

A minimal anvil or forge hammer icon — geometric, not illustrative. The hammer head forms a `>` angle suggesting a command line prompt or a forward-pointing motion (forge → output). Rendered in Forge Amber on Forge Dark. The wordmark uses `ReadMe` in Parchment White and `Forge` in Forge Amber to emphasize the tool's identity over the output type.

---

## Brand Voice

### Core Voice Attributes

**Encouraging but not cheerleader** — ReadMeForge deals with a task that developers find tedious. The voice acknowledges that READMEs matter without lecturing developers about documentation culture.

**Results-oriented** — Lead with the output quality. "Here's what you'll get" not "Here's how it works."

**Technically honest** — Template-driven, not magic. ReadMeForge is transparent that it analyzes real repo structure — it does not pretend to understand the project deeply. It documents what it detects.

**Confident** — The output is professional quality. The copy does not hedge or say "a README that might help." It says "a professional README."

**Direct** — Short sentences, clear CTAs. The user came to get a README — help them get it, then get out of the way.

### Voice in Practice

| Context | Avoid | Use Instead |
|---------|-------|-------------|
| Landing headline | "Transform your repository documentation experience with AI-powered README intelligence" | "Paste your GitHub URL. Get a professional README with badges in seconds." |
| How it works | "Our sophisticated AI analyzes your codebase to understand your project's essence" | "ReadMeForge fetches your repo structure, detects your stack, and generates a README that reflects what's actually in it." |
| Empty history state | "Your README journey starts here! Generate your first README to get started." | "No READMEs yet. Paste a GitHub URL above." |
| Success state | "Amazing! Your README has been forged! You're going to love it!" | "README generated. 8 badges detected. 6 sections written." |
| Feature copy | "Powered by cutting-edge AI to give you world-class documentation" | "Template-driven generation — no API costs, no rate limits, instant output." |
| Error state | "Uh oh! We couldn't access that repository." | "Repository not found or is private. ReadMeForge requires a public GitHub URL." |

### What ReadMeForge Is Not

- Not a full documentation platform (it generates a README, not a documentation site)
- Not an AI chat interface (it reads the repo — you don't describe your project)
- Not a writing assistant (it produces a complete draft, not suggestions)
- Not condescending about documentation (developers know READMEs matter; they just don't want to write them)
- Not a template library (the output is generated from real codebase analysis, not filled-in blanks)

---

## Viral Loop: The Badge

The "Generated with ReadMeForge" badge embedded in every generated README is the most important brand asset. It appears on GitHub as:

```markdown
[![Generated with ReadMeForge](https://img.shields.io/badge/Generated_with-ReadMeForge-F59E0B?style=flat-square&logo=github)](https://readmeforge.veridux.ai)
```

This badge renders in Forge Amber, links to readmeforge.veridux.ai, and is visible to any developer who views the repository on GitHub. The badge is included in the Free tier output and can be optionally removed on Pro tier. Research from similar viral loops (Made with Notion, Built with Carrd) shows that most users keep attribution badges when they are well-designed and don't feel like spam.

---

## Positioning Statement (Internal)

ReadMeForge exists because most GitHub repositories deserve better documentation than they have, and most developers will never find the time to write it. ReadMeForge closes that gap in 30 seconds. The output is not a placeholder — it is a professional artifact that reflects what is actually in the repo. The forge does real work.

---

## Veridux Labs Brand Relationship

ReadMeForge carries Veridux Labs' technical credibility while being the most "accessible" product in the portfolio — it targets bootcamp graduates and OSS maintainers alongside professional developers. The Forge Amber accent is ReadMeForge-specific within the Veridux portfolio and references the warmth of documentation (human communication) vs. the colder tones of infrastructure tools like DeployDiff and APIGhost.

---

## Asset Checklist

- [ ] Logo (SVG — wordmark with amber "Forge" and icon mark)
- [ ] Favicon (16x16, 32x32, 180x180 apple-touch)
- [ ] Open Graph image (1200x630 — show URL input field + generated README preview with badge strip)
- [ ] Product Hunt thumbnail (240x240)
- [ ] Twitter/X card image (1200x628 — before/after: minimal repo → professional README)
- [ ] Demo GIF (URL input → badge strip renders → README preview populates, < 12 seconds)
- [ ] "Generated with ReadMeForge" badge asset (shield.io URL documented and tested)
- [ ] Hero screenshot (split-pane: URL input left, README preview with badges right)
