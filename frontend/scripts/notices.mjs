import fs from 'node:fs'
import path from 'node:path'
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'))
const output = 'public/licenses'
fs.mkdirSync(output, { recursive: true })
const packages = ['react', 'react-dom', 'scheduler', 'loose-envify', 'js-tokens', '@fontsource-variable/dm-sans', '@fontsource-variable/manrope']
for (const name of packages) {
  const dir = path.join('node_modules', name)
  const file = fs.readdirSync(dir).find(f => /^licen[cs]e(\.txt|\.md)?$/i.test(f))
  if (!file) throw new Error(`Missing license: ${name}`)
  fs.copyFileSync(path.join(dir, file), path.join(output, `${name.replaceAll('/', '-').replace('@', '')}.txt`))
}
const rows = Object.entries(lock.packages).filter(([key]) => key).map(([key, pkg]) => `| ${key.replace(/^node_modules\//, '')} | ${pkg.version} | ${pkg.license || 'See package license'} | ${pkg.dev ? 'Build / test' : 'Runtime / optional platform'} |`)
fs.writeFileSync('../THIRD_PARTY_NOTICES.md', `# Third-party notices\n\nGenerated from the committed npm lockfile. Dependencies are not claimed as original work.\nReact, React DOM, scheduler, loose-envify and js-tokens are MIT; their full notices\nship in frontend/public/licenses/. DM Sans (DM Sans Project Authors) and Manrope\n(Manrope Project Authors) are SIL OFL 1.1; their full licenses ship in the same directory.\nNo fonts are modified or fetched from a third-party font service at runtime.\n\nMarket data providers: Coinbase and Kraken public APIs. Provider names are attribution,\nnot endorsement. Prices remain provider data, not software licensed by this project.\n\nHistorical source is excluded from the new MIT license; see PROVENANCE.md.\n\n| Package | Locked version | License | Use |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`)
