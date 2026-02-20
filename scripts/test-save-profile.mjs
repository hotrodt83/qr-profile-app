import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const path = resolve(root, name)
    if (!existsSync(path)) continue
    const raw = readFileSync(path, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      let key = trimmed.slice(0, eq).trim()
      if (key.startsWith('export ')) key = key.slice(7).trim()
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
      let val = trimmed.slice(eq + 1).trim()
      const comment = val.indexOf('#')
      if (comment !== -1) val = val.slice(0, comment).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      process.env[key] = val
    }
  }
}
loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, anon)

const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD

if (!email || !password) {
  console.error('Missing TEST_EMAIL and/or TEST_PASSWORD.')
  console.error('Add them to .env.local (see .env.example). Example:')
  console.error('  TEST_EMAIL=your@email.com')
  console.error('  TEST_PASSWORD=your-password')
  process.exit(1)
}

const run = async () => {
  console.log('1) Signing in...')
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
  if (authErr) throw authErr

  const userId = auth.user.id
  console.log('✅ Signed in as:', userId)

  const payload = {
    id: userId,
    username: 'mj_test_' + Date.now(),
    display_name: 'MJ Test',
    bio: 'Automated save test',
    email,
    phone: '2109080403',
    whatsapp: '2109080403',
    telegram: 'Mj Ismail',
    avatar_url: null,
    updated_at: new Date().toISOString(),
  }

  console.log('2) Upserting profile...')
  const { data: upserted, error: upErr } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (upErr) throw upErr
  console.log('✅ Upsert returned row:', upserted)

  console.log('3) Reading it back (SELECT)...')
  const { data: fetched, error: selErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (selErr) throw selErr
  console.log('✅ Readback row:', fetched)

  console.log('\n🎉 SAVE TEST PASSED')
}

run().catch((e) => {
  console.error('\n❌ SAVE TEST FAILED')
  console.error(e?.message || e)
  process.exit(1)
})
