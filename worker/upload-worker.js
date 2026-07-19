const ALLOWED_ORIGINS = new Set([
  'https://ricardolopezreyero.github.io',
  'http://127.0.0.1:5178',
  'http://localhost:5178',
])

function corsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://ricardolopezreyero.github.io'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Key',
    'Vary': 'Origin',
  }
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
    },
  })
}

function sanitizePathPart(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._/-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-/]+|[-/]+$/g, '')
}

function normalizeUploadPath(value) {
  const clean = sanitizePathPart(value)
  if (!clean || clean.includes('..')) return ''
  return clean.endsWith('.png') ? clean : `${clean}.png`
}

async function githubPutFile(env, path, content, message) {
  const owner = env.GITHUB_OWNER || 'ricardolopezreyero'
  const repo = env.GITHUB_REPO || 'Escritos_portadas'
  const branch = env.GITHUB_BRANCH || 'main'
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'escritos-portadas-worker',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message,
      content,
      branch,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { ok: false, status: response.status, data }
  }
  return { ok: true, status: response.status, data }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, origin)
    }

    if (!env.GITHUB_TOKEN || !env.UPLOAD_KEY) {
      return json({ error: 'worker_missing_secrets' }, 500, origin)
    }

    if (request.headers.get('X-Upload-Key') !== env.UPLOAD_KEY) {
      return json({ error: 'unauthorized' }, 401, origin)
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body.imageBase64 !== 'string') {
      return json({ error: 'invalid_payload' }, 400, origin)
    }

    const path = normalizeUploadPath(body.path || body.fileName)
    if (!path || !path.startsWith('portadas/')) {
      return json({ error: 'invalid_path' }, 400, origin)
    }

    if (!/^[A-Za-z0-9+/=]+$/.test(body.imageBase64) || body.imageBase64.length > 8_000_000) {
      return json({ error: 'invalid_image' }, 400, origin)
    }

    const title = String(body.title || 'portada').slice(0, 90)
    const result = await githubPutFile(
      env,
      path,
      body.imageBase64,
      `Add portada: ${title}`
    )

    if (!result.ok) {
      return json({ error: 'github_error', detail: result.data }, result.status, origin)
    }

    return json({
      ok: true,
      path,
      html_url: result.data.content?.html_url || null,
      download_url: result.data.content?.download_url || null,
    }, 200, origin)
  },
}
