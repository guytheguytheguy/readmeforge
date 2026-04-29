import { describe, it, expect } from "vitest";
import { generateReadme } from "./readme-generator";
import type { RepoInfo } from "./github";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInfo(overrides: Partial<RepoInfo> = {}): RepoInfo {
  return {
    owner: "acme",
    repo: "my-app",
    description: null,
    defaultBranch: "main",
    language: null,
    topics: [],
    license: null,
    hasTests: false,
    hasDocker: false,
    hasCi: false,
    packageJson: null,
    files: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Framework detection (via generateReadme output)
// ---------------------------------------------------------------------------

describe("framework detection", () => {
  it("detects Next.js from dependencies", () => {
    const readme = generateReadme(
      makeInfo({ packageJson: { dependencies: { next: "15.0.0" } } })
    );
    expect(readme).toContain("Next.js");
  });

  it("detects React when next is absent", () => {
    const readme = generateReadme(
      makeInfo({ packageJson: { dependencies: { react: "19.0.0" } } })
    );
    expect(readme).toContain("React");
    expect(readme).not.toContain("Next.js");
  });

  it("detects Vue from dependencies", () => {
    const readme = generateReadme(
      makeInfo({ packageJson: { dependencies: { vue: "3.0.0" } } })
    );
    expect(readme).toContain("Vue");
  });

  it("detects Svelte from dependencies", () => {
    const readme = generateReadme(
      makeInfo({ packageJson: { devDependencies: { svelte: "4.0.0" } } })
    );
    expect(readme).toContain("Svelte");
  });

  it("detects Express from dependencies", () => {
    const readme = generateReadme(
      makeInfo({ packageJson: { dependencies: { express: "^4.18.0" } } })
    );
    expect(readme).toContain("Express");
  });

  it("detects Fastify from dependencies", () => {
    const readme = generateReadme(
      makeInfo({ packageJson: { dependencies: { fastify: "^4.0.0" } } })
    );
    expect(readme).toContain("Fastify");
  });

  it("detects Python from requirements.txt", () => {
    const readme = generateReadme(makeInfo({ files: ["requirements.txt"] }));
    expect(readme).toContain("Python");
  });

  it("detects Python from setup.py", () => {
    const readme = generateReadme(makeInfo({ files: ["setup.py"] }));
    expect(readme).toContain("Python");
  });

  it("detects Go from go.mod", () => {
    const readme = generateReadme(makeInfo({ files: ["go.mod"] }));
    expect(readme).toContain("Go");
  });

  it("detects Rust from Cargo.toml", () => {
    const readme = generateReadme(makeInfo({ files: ["Cargo.toml"] }));
    expect(readme).toContain("Rust");
  });

  it("detects Java from pom.xml", () => {
    const readme = generateReadme(makeInfo({ files: ["pom.xml"] }));
    expect(readme).toContain("Java");
  });

  it("detects Java from build.gradle", () => {
    const readme = generateReadme(makeInfo({ files: ["build.gradle"] }));
    expect(readme).toContain("Java");
  });

  it("falls back to repo language when no framework detected", () => {
    const readme = generateReadme(makeInfo({ language: "TypeScript" }));
    expect(readme).toContain("TypeScript");
  });

  it("next.js takes priority over react when both are present", () => {
    const readme = generateReadme(
      makeInfo({
        packageJson: { dependencies: { next: "15.0.0", react: "19.0.0" } },
      })
    );
    expect(readme).toContain("Next.js");
    // React badge/feature should NOT appear as a separate framework line
    const frameworkMatches = readme.match(/framework-/g);
    // Only one framework badge expected
    expect(frameworkMatches?.length).toBe(1);
  });

  it("merges deps and devDeps for detection", () => {
    const readme = generateReadme(
      makeInfo({
        packageJson: {
          dependencies: {},
          devDependencies: { svelte: "^4.0.0" },
        },
      })
    );
    expect(readme).toContain("Svelte");
  });
});

// ---------------------------------------------------------------------------
// Package manager detection
// ---------------------------------------------------------------------------

describe("package manager detection", () => {
  it("detects pnpm from pnpm-lock.yaml", () => {
    const readme = generateReadme(makeInfo({ files: ["pnpm-lock.yaml"] }));
    expect(readme).toContain("pnpm install");
    expect(readme).toContain("pnpm dev");
  });

  it("detects yarn from yarn.lock", () => {
    const readme = generateReadme(makeInfo({ files: ["yarn.lock"] }));
    expect(readme).toContain("yarn");
    // yarn install command is just `yarn`
    expect(readme).toMatch(/^# Install dependencies\nyarn$/m);
  });

  it("detects npm from package-lock.json", () => {
    const readme = generateReadme(makeInfo({ files: ["package-lock.json"] }));
    expect(readme).toContain("npm install");
    expect(readme).toContain("npm run dev");
  });

  it("detects bun from bun.lockb", () => {
    const readme = generateReadme(makeInfo({ files: ["bun.lockb"] }));
    expect(readme).toContain("bun install");
    expect(readme).toContain("bun run dev");
  });

  it("falls back to npm when no lockfile present", () => {
    const readme = generateReadme(makeInfo({ files: [] }));
    expect(readme).toContain("npm install");
  });

  it("pnpm takes priority over yarn when both lockfiles listed", () => {
    const readme = generateReadme(
      makeInfo({ files: ["pnpm-lock.yaml", "yarn.lock"] })
    );
    expect(readme).toContain("pnpm install");
  });
});

// ---------------------------------------------------------------------------
// Badge generation
// ---------------------------------------------------------------------------

describe("badge generation", () => {
  it("includes license badge when license present", () => {
    const readme = generateReadme(makeInfo({ license: "MIT" }));
    expect(readme).toContain("https://img.shields.io/badge/license-MIT-blue.svg");
  });

  it("encodes spaces in license name", () => {
    const readme = generateReadme(makeInfo({ license: "Apache 2.0" }));
    expect(readme).toContain("Apache%202.0");
  });

  it("includes framework badge when framework is detected", () => {
    const readme = generateReadme(
      makeInfo({ packageJson: { dependencies: { next: "15.0.0" } } })
    );
    expect(readme).toContain("img.shields.io/badge/framework-Next.js-informational.svg");
  });

  it("does not include framework badge when framework is Unknown", () => {
    const readme = generateReadme(makeInfo({ language: null }));
    expect(readme).not.toContain("framework-Unknown");
  });

  it("includes tests badge when hasTests is true", () => {
    const readme = generateReadme(makeInfo({ hasTests: true }));
    expect(readme).toContain("tests-passing-brightgreen");
  });

  it("does not include tests badge when hasTests is false", () => {
    const readme = generateReadme(makeInfo({ hasTests: false }));
    expect(readme).not.toContain("tests-passing");
  });

  it("includes docker badge when hasDocker is true", () => {
    const readme = generateReadme(makeInfo({ hasDocker: true }));
    expect(readme).toContain("docker-ready-blue");
  });

  it("includes no badges section when nothing is set", () => {
    const readme = generateReadme(makeInfo());
    expect(readme).not.toContain("shields.io");
  });
});

// ---------------------------------------------------------------------------
// Install / run command generation
// ---------------------------------------------------------------------------

describe("install and run command generation", () => {
  it("generates correct pnpm commands", () => {
    const readme = generateReadme(makeInfo({ files: ["pnpm-lock.yaml"] }));
    expect(readme).toContain("pnpm install");
    expect(readme).toContain("pnpm build");
  });

  it("generates correct yarn commands", () => {
    const readme = generateReadme(makeInfo({ files: ["yarn.lock"] }));
    expect(readme).toContain("yarn build");
  });

  it("generates correct bun commands", () => {
    const readme = generateReadme(
      makeInfo({ files: ["bun.lockb"], hasTests: true })
    );
    expect(readme).toContain("bun run build");
    expect(readme).toContain("bun run test");
  });

  it("includes test command when hasTests is true", () => {
    const readme = generateReadme(
      makeInfo({ files: ["package-lock.json"], hasTests: true })
    );
    expect(readme).toContain("npm run test");
  });

  it("omits test command when hasTests is false", () => {
    const readme = generateReadme(
      makeInfo({ files: ["package-lock.json"], hasTests: false })
    );
    expect(readme).not.toContain("npm run test");
  });

  it("includes env copy command when .env.example is present", () => {
    const readme = generateReadme(
      makeInfo({ files: ["package-lock.json", ".env.example"] })
    );
    expect(readme).toContain("cp .env.example .env.local");
  });

  it("includes env copy command when .env.local.example is present", () => {
    const readme = generateReadme(
      makeInfo({ files: ["package-lock.json", ".env.local.example"] })
    );
    expect(readme).toContain("cp .env.example .env.local");
  });

  it("omits env copy command when no .env.example present", () => {
    const readme = generateReadme(makeInfo({ files: ["package-lock.json"] }));
    expect(readme).not.toContain("cp .env.example");
  });

  it("includes Docker alternative section when hasDocker is true", () => {
    const readme = generateReadme(makeInfo({ hasDocker: true }));
    expect(readme).toContain("docker compose up --build");
  });

  it("includes start command when package.json has a start script", () => {
    const readme = generateReadme(
      makeInfo({
        files: ["package-lock.json"],
        packageJson: { scripts: { start: "node server.js" } },
      })
    );
    expect(readme).toContain("npm run start");
  });

  it("omits start command when no start script defined", () => {
    const readme = generateReadme(
      makeInfo({
        files: ["package-lock.json"],
        packageJson: { scripts: { dev: "next dev" } },
      })
    );
    expect(readme).not.toContain("npm run start");
  });
});

// ---------------------------------------------------------------------------
// README structure and content
// ---------------------------------------------------------------------------

describe("readme structure", () => {
  it("starts with repo name as H1", () => {
    const readme = generateReadme(makeInfo({ repo: "cool-project" }));
    expect(readme).toMatch(/^# cool-project\n/);
  });

  it("uses custom description when provided", () => {
    const readme = generateReadme(
      makeInfo({ description: "My custom description" })
    );
    expect(readme).toContain("My custom description");
  });

  it("generates default description when none provided", () => {
    const readme = generateReadme(
      makeInfo({ owner: "john", repo: "my-lib", language: "TypeScript" })
    );
    expect(readme).toContain("my-lib — a TypeScript project by john.");
  });

  it("includes getting started section", () => {
    const readme = generateReadme(makeInfo());
    expect(readme).toContain("## Getting Started");
  });

  it("includes contributing section", () => {
    const readme = generateReadme(makeInfo());
    expect(readme).toContain("## Contributing");
  });

  it("includes license section when license set", () => {
    const readme = generateReadme(makeInfo({ license: "MIT" }));
    expect(readme).toContain("## License");
    expect(readme).toContain("[MIT](./LICENSE)");
  });

  it("omits license section when license is null", () => {
    const readme = generateReadme(makeInfo({ license: null }));
    expect(readme).not.toContain("## License");
  });

  it("includes ReadMeForge attribution footer", () => {
    const readme = generateReadme(makeInfo());
    expect(readme).toContain("ReadMeForge");
    expect(readme).toContain("readmeforge.veridux.ai");
  });

  it("includes CI/CD feature when hasCi is true", () => {
    const readme = generateReadme(makeInfo({ hasCi: true }));
    expect(readme).toContain("CI/CD pipeline configured");
  });

  it("includes topics when present", () => {
    const readme = generateReadme(
      makeInfo({ topics: ["typescript", "nextjs"] })
    );
    expect(readme).toContain("`typescript`");
    expect(readme).toContain("`nextjs`");
  });

  it("includes Next.js bun note in prerequisites", () => {
    const readme = generateReadme(
      makeInfo({ packageJson: { dependencies: { next: "15.0.0" } } })
    );
    expect(readme).toContain("or Bun");
  });

  it("includes clone command with correct owner/repo", () => {
    const readme = generateReadme(makeInfo({ owner: "jane", repo: "awesome" }));
    expect(readme).toContain("git clone https://github.com/jane/awesome.git");
  });
});

// ---------------------------------------------------------------------------
// Project structure section
// ---------------------------------------------------------------------------

describe("project structure section", () => {
  it("includes project structure section when files present", () => {
    const readme = generateReadme(
      makeInfo({ files: ["src/index.ts", "package.json", "README.md"] })
    );
    expect(readme).toContain("## Project Structure");
  });

  it("omits project structure section when no files", () => {
    const readme = generateReadme(makeInfo({ files: [] }));
    expect(readme).not.toContain("## Project Structure");
  });

  it("limits structure to at most 15 entries", () => {
    const manyFiles = Array.from({ length: 25 }, (_, i) => `file${i}.ts`);
    const readme = generateReadme(makeInfo({ files: manyFiles }));
    const structureMatch = readme.match(/├── /g);
    expect(structureMatch?.length).toBeLessThanOrEqual(15);
  });
});
