export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <a href="/" className="font-bold text-xl flex items-center gap-2 w-fit">
          <span>📄</span> ReadMeForge
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-gray-400 text-lg mb-12">
          Everything you need to know about ReadMeForge.
        </p>

        {/* Quick Start */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Quick Start</h2>
          <ol className="space-y-4 text-gray-300">
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold shrink-0">1.</span>
              <span>
                Go to the <a href="/" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">home page</a>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold shrink-0">2.</span>
              <span>Paste any public GitHub repository URL into the input field (e.g. <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm">https://github.com/owner/repo</code>).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold shrink-0">3.</span>
              <span>Click <strong>Generate README</strong>. Your README is ready in seconds.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400 font-bold shrink-0">4.</span>
              <span>Copy the output or download it as <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm">README.md</code>.</span>
            </li>
          </ol>
        </section>

        {/* What Gets Detected */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-400">What Gets Detected</h2>
          <p className="text-gray-400 mb-6">
            ReadMeForge analyzes your repository's file tree and package metadata — no AI inference, no hallucinations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Framework", detail: "Next.js, React, Vue, Svelte, Express, Fastify, FastAPI, Django, Go, Rust, Java Spring" },
              { label: "Package Manager", detail: "npm, yarn, pnpm, bun, pip, cargo, go modules, maven, gradle" },
              { label: "Language", detail: "TypeScript, JavaScript, Python, Go, Rust, Java, Ruby, PHP" },
              { label: "Tests", detail: "Jest, Vitest, Playwright, Cypress, pytest, go test — detected from config files" },
              { label: "Docker", detail: "Detected if Dockerfile or docker-compose.yml is present" },
              { label: "CI/CD", detail: ".github/workflows/, .circleci/, .travis.yml, GitLab CI" },
              { label: "License", detail: "MIT, Apache 2.0, GPL, ISC — read from LICENSE file" },
              { label: "Badges", detail: "Auto-generated for framework, package manager, license, tests, Docker" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-semibold text-white mb-1">{item.label}</p>
                <p className="text-sm text-gray-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* README Structure */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Generated README Structure</h2>
          <p className="text-gray-400 mb-4">Every generated README follows this structure:</p>
          <pre className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
{`# Project Name

![Framework](badge) ![Tests](badge) ![License](badge)

> Short description from repository metadata

## Features
- Auto-detected features

## Tech Stack
- Framework, language, runtime

## Getting Started
### Prerequisites
### Installation
### Running the App

## Running Tests

## Project Structure

## License`}
          </pre>
        </section>

        {/* Limits */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Usage Limits</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-800 rounded-xl overflow-hidden">
              <thead className="bg-gray-900 text-gray-400">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-800">Plan</th>
                  <th className="px-4 py-3 border-b border-gray-800">READMEs / month</th>
                  <th className="px-4 py-3 border-b border-gray-800">Private repos</th>
                  <th className="px-4 py-3 border-b border-gray-800">History</th>
                </tr>
              </thead>
              <tbody className="bg-gray-950 divide-y divide-gray-800">
                <tr>
                  <td className="px-4 py-3 text-gray-300">Free</td>
                  <td className="px-4 py-3 text-gray-300">5</td>
                  <td className="px-4 py-3 text-gray-500">No</td>
                  <td className="px-4 py-3 text-gray-500">No</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-white font-medium">Pro <span className="text-indigo-400 text-xs ml-1">$9/mo</span></td>
                  <td className="px-4 py-3 text-white">Unlimited</td>
                  <td className="px-4 py-3 text-green-400">Yes</td>
                  <td className="px-4 py-3 text-green-400">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-400">FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: "Does it work with private repositories?",
                a: "Private repository support is available on the Pro plan. You'll authenticate once and ReadMeForge will access your repos securely.",
              },
              {
                q: "How accurate is the detection?",
                a: "Detection is based on actual files in your repository — package.json, go.mod, Cargo.toml, etc. It doesn't guess or infer. If a config file is present, it's detected.",
              },
              {
                q: "Can I customize the generated README?",
                a: "After generating, copy the Markdown and edit it in any text editor or directly in GitHub. Custom section templates are coming to the Pro plan.",
              },
              {
                q: "What if my framework isn't detected?",
                a: "ReadMeForge supports 10+ frameworks. If yours isn't listed, the README will still be generated with the sections that can be detected. Open a request on our roadmap.",
              },
              {
                q: "Is there an API?",
                a: "A public API is planned for Pro users. The current tool is available via the web interface only.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-gray-800 pb-6 last:border-0">
                <p className="font-semibold text-white mb-2">{item.q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Ready to generate your README?</p>
          <p className="text-gray-400 text-sm mb-6">Paste a GitHub URL and get a professional README in seconds.</p>
          <a
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Try ReadMeForge Free
          </a>
        </div>
      </main>
    </div>
  );
}
