import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'))

const LICENSE_FILE = /^(licen[cs]e|copying|copyright)([.\-_].*)?$/i
const MAX_TEXT = 20000

function readLicenseText(dir) {
  if (!existsSync(dir)) return ''
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return ''
  }

  const file = entries
    .filter((entry) => entry.isFile() && LICENSE_FILE.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))[0]

  if (!file) return ''
  try {
    return readFileSync(resolve(dir, file.name), 'utf8').slice(0, MAX_TEXT).trim()
  } catch {
    return ''
  }
}

const HOSTED_SHORTHAND = {
  github: 'https://github.com',
  gitlab: 'https://gitlab.com',
  bitbucket: 'https://bitbucket.org'
}

function normalizeRepo(repo) {
  if (!repo) return ''
  let url = typeof repo === 'string' ? repo : repo.url
  if (!url) return ''

  const hosted = /^(github|gitlab|bitbucket):(.+)$/i.exec(url)
  if (hosted) {
    return `${HOSTED_SHORTHAND[hosted[1].toLowerCase()]}/${hosted[2].replace(/\.git$/, '')}`
  }

  if (/^[\w.-]+\/[\w.-]+$/.test(url)) {
    return `https://github.com/${url.replace(/\.git$/, '')}`
  }

  return url
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@/, 'https://')
    .replace(/^git@([^:]+):/, 'https://$1/')
    .replace(/\.git$/, '')
}

function githubRepo(repo) {
  const match = /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i.exec(repo)
  return match ? { owner: match[1], name: match[2] } : null
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'website-license-generator' }
  })
  if (!response.ok) throw new Error(`http ${response.status}`)
  return response.json()
}

const repoLicenseCache = new Map()

async function fetchRepoLicense(repo) {
  const gh = githubRepo(repo)
  if (!gh) return ''
  if (repoLicenseCache.has(repo)) return repoLicenseCache.get(repo)

  const branches = []
  try {
    const meta = await fetchJson(`https://api.github.com/repos/${gh.owner}/${gh.name}`)
    if (meta.default_branch) branches.push(meta.default_branch)
  } catch {
  }
  for (const branch of ['main', 'master']) {
    if (!branches.includes(branch)) branches.push(branch)
  }

  const names = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING', 'LICENSE-MIT', 'LICENSE-APACHE']

  let text = ''
  for (const branch of branches) {
    for (const name of names) {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/${gh.owner}/${gh.name}/${branch}/${name}`
        )
        if (response.ok) {
          text = (await response.text()).slice(0, MAX_TEXT).trim()
          break
        }
      } catch {
      }
    }
    if (text) break
  }

  repoLicenseCache.set(repo, text)
  return text
}

const packages = Object.entries(lock.packages || {}).filter(([key]) => key)

const registryCache = new Map()

async function fetchRegistry(name, version) {
  const key = `${name}@${version}`
  if (registryCache.has(key)) return registryCache.get(key)

  let data = {}
  try {
    const encoded = name.startsWith('@') ? name.replace('/', '%2F') : name
    data = await fetchJson(`https://registry.npmjs.org/${encoded}/${version}`)
  } catch {
    data = {}
  }

  registryCache.set(key, data)
  return data
}

const texts = []
const textIndex = new Map()

function intern(text) {
  if (!text) return -1
  if (!textIndex.has(text)) {
    textIndex.set(text, texts.length)
    texts.push(text)
  }
  return textIndex.get(text)
}

const output = []

for (const [key, meta] of packages) {
  if (meta.os || meta.cpu) continue

  const dir = resolve(root, key)
  let manifest = {}
  try {
    manifest = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8'))
  } catch {
    manifest = {}
  }

  const license =
    (typeof manifest.license === 'string' ? manifest.license : manifest.license && manifest.license.type) ||
    meta.license ||
    'UNKNOWN'

  let repo = normalizeRepo(manifest.repository)
  let homepage = manifest.homepage || ''
  let text = readLicenseText(dir)

  if ((!repo && !text) || !manifest.name) {
    const registry = await fetchRegistry(key.split('node_modules/').pop(), meta.version || '')
    repo = repo || normalizeRepo(registry.repository)
    homepage = homepage || registry.homepage || ''
  }

  if (!text) text = await fetchRepoLicense(repo)

  output.push({
    name: key.split('node_modules/').pop(),
    version: meta.version || '',
    license,
    dev: Boolean(meta.dev),
    homepage,
    repo,
    text: intern(text)
  })
}

output.sort((a, b) => a.name.localeCompare(b.name))

const deduped = output.filter(
  (pkg, index, list) =>
    list.findIndex((other) => other.name === pkg.name && other.version === pkg.version) === index
)

writeFileSync(
  resolve(root, 'src/data/licenses.json'),
  `${JSON.stringify({ license: '0BSD', count: deduped.length, texts, packages: deduped }, null, 2)}\n`
)

console.log(`licenses.json: ${deduped.length} packages, ${texts.length} unique license texts`)
