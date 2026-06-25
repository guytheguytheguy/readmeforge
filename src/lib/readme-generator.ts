import type { RepoInfo } from "./github";

function detectFramework(info: RepoInfo): string {
  const deps = {
    ...(info.packageJson?.dependencies as Record<string, string> | undefined),
    ...(info.packageJson?.devDependencies as Record<string, string> | undefined),
  };

  if (deps?.next) return "Next.js";
  if (deps?.react) return "React";
  if (deps?.vue) return "Vue";
  if (deps?.svelte) return "Svelte";
  if (deps?.express) return "Express";
  if (deps?.fastify) return "Fastify";
  if (info.files.includes("requirements.txt") || info.files.includes("setup.py")) return "Python";
  if (info.files.includes("go.mod")) return "Go";
  if (info.files.includes("Cargo.toml")) return "Rust";
  if (info.files.includes("pom.xml") || info.files.includes("build.gradle")) return "Java";
  return info.language || "Unknown";
}

function detectPackageManager(info: RepoInfo): string {
  if (info.files.includes("pnpm-lock.yaml")) return "pnpm";
  if (info.files.includes("yarn.lock")) return "yarn";
  if (info.files.includes("package-lock.json")) return "npm";
  if (info.files.includes("bun.lockb")) return "bun";
  return "npm";
}

function getInstallCmd(pm: string): string {
  if (pm === "pnpm") return "pnpm install";
  if (pm === "yarn") return "yarn";
  if (pm === "bun") return "bun install";
  return "npm install";
}

function getRunCmd(pm: string, script = "dev"): string {
  if (pm === "pnpm") return `pnpm ${script}`;
  if (pm === "yarn") return `yarn ${script}`;
  if (pm === "bun") return `bun run ${script}`;
  return `npm run ${script}`;
}

function buildBadges(info: RepoInfo, framework: string): string {
  const badges: string[] = [];
  if (info.license) {
    badges.push(
      `![License](https://img.shields.io/badge/license-${encodeURIComponent(info.license)}-blue.svg)`
    );
  }
  if (framework !== "Unknown") {
    badges.push(
      `![Framework](https://img.shields.io/badge/framework-${encodeURIComponent(framework)}-informational.svg)`
    );
  }
  if (info.hasTests) {
    badges.push(`![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)`);
  }
  if (info.hasDocker) {
    badges.push(`![Docker](https://img.shields.io/badge/docker-ready-blue.svg)`);
  }
  return badges.join(" ");
}

function buildFeaturesSection(info: RepoInfo, framework: string): string {
  const features: string[] = [];

  if (framework !== "Unknown") features.push(`Built with **${framework}**`);
  if (info.language) features.push(`Primary language: **${info.language}**`);
  if (info.hasTests) features.push("✅ Test suite included");
  if (info.hasDocker) features.push("🐳 Docker support");
  if (info.hasCi) features.push("🔄 CI/CD pipeline configured");
  if (info.topics.length > 0) features.push(`Topics: ${info.topics.map((t) => `\`${t}\``).join(", ")}`);

  return features.map((f) => `- ${f}`).join("\n");
}

function buildInstallSection(info: RepoInfo, pm: string, framework: string): string {
  const installCmd = getInstallCmd(pm);
  const devCmd = getRunCmd(pm, "dev");
  const buildCmd = getRunCmd(pm, "build");
  const testCmd = info.hasTests ? `\n\n# Run tests\n${getRunCmd(pm, "test")}` : "";

  const envSource = info.files.includes(".env.example")
    ? ".env.example"
    : info.files.includes(".env.local.example")
    ? ".env.local.example"
    : null;
  const envSetup = envSource
    ? `\n\n# Copy env file and fill in values\ncp ${envSource} .env.local`
    : "";

  const dockerAlt = info.hasDocker
    ? `\n\n### Docker\n\n\`\`\`bash\ndocker compose up --build\n\`\`\``
    : "";

  const scripts = (info.packageJson?.scripts as Record<string, string> | undefined) || {};
  const hasStart = "start" in scripts;

  return `### Prerequisites

- Node.js 18+${framework === "Next.js" ? " (or Bun)" : ""}
- ${pm}

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/${info.owner}/${info.repo}.git
cd ${info.repo}
${envSetup}
# Install dependencies
${installCmd}

# Start development server
${devCmd}
\`\`\`

### Build for Production

\`\`\`bash
${buildCmd}${hasStart ? `\n${getRunCmd(pm, "start")}` : ""}${testCmd}
\`\`\`${dockerAlt}`;
}

function buildProjectStructure(info: RepoInfo): string {
  if (info.files.length === 0) return "";

  // Extract top-level names (unique root files + dirs)
  const seen = new Set<string>();
  const topLevel: string[] = [];
  for (const f of info.files) {
    const root = f.split("/")[0];
    if (!seen.has(root)) {
      seen.add(root);
      topLevel.push(root);
    }
    if (topLevel.length >= 20) break;
  }

  if (topLevel.length === 0) return "";

  const entries = topLevel.slice(0, 15);
  const tree = entries
    .map((name, i) => {
      const prefix = i === entries.length - 1 ? "└──" : "├──";
      // Mark as directory if any file has this as a path prefix
      const isDir = info.files.some((f) => f.startsWith(name + "/"));
      return `${prefix} ${name}${isDir ? "/" : ""}`;
    })
    .join("\n");

  return `\n## Project Structure\n\n\`\`\`\n${tree}\n\`\`\`\n`;
}

export function generateReadme(info: RepoInfo): string {
  const framework = detectFramework(info);
  const pm = detectPackageManager(info);
  const badges = buildBadges(info, framework);
  const features = buildFeaturesSection(info, framework);
  const installSection = buildInstallSection(info, pm, framework);
  const structureSection = buildProjectStructure(info);

  const description =
    info.description || `${info.repo} — a ${framework} project by ${info.owner}.`;

  const licenseSection = info.license
    ? `\n## License\n\nThis project is licensed under the [${info.license}](./LICENSE) license.\n`
    : "";

  const contributingSection = `
## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/my-feature\`
3. Commit your changes: \`git commit -m "feat: add my feature"\`
4. Push to the branch: \`git push origin feature/my-feature\`
5. Open a pull request
`;

  return `# ${info.repo}

${badges ? badges + "\n" : ""}
${description}

## Features

${features}

## Getting Started

${installSection}
${structureSection}
## Contributing
${contributingSection}${licenseSection}
---

> README generated by [ReadMeForge](https://readmeforge.veridux.ai) — AI-powered README generator.
`;
}
