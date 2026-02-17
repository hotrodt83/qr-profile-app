'use client'

import { useState, useCallback } from 'react'
import type { ProfileRow, ProfileFields } from '@/lib/types'
import type { PlatformKey } from '@/lib/types'
import { PLATFORM_KEYS, PLATFORM_CONFIG } from '@/lib/platforms'

type Props = {
  profile: ProfileRow
  onSave: (updates: {
    display_name: string | null
    avatar_url: string | null
    fields: ProfileFields
  }) => Promise<void>
}

export default function DashboardForm({ profile, onSave }: Props) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [fields, setFields] = useState<ProfileFields>({ ...profile.fields })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const updateField = useCallback((key: PlatformKey, value: string, visible: boolean) => {
    setFields((prev) => {
      const next = { ...prev }
      if (!value.trim() && !visible) {
        const { [key]: _, ...rest } = next
        return rest
      }
      next[key] = { value: value.trim(), visible }
      return next
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSaving(true)
    try {
      await onSave({
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        fields,
      })
      setMessage({ type: 'ok', text: 'Saved.' })
      setTimeout(() => setMessage(null), 2000)
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dashboard-form">
      <h2 className="dashboard-form-title">Your profile</h2>
      <label className="dashboard-label">
        Display name
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="dashboard-input"
        />
      </label>
      <label className="dashboard-label">
        Avatar URL <span className="dashboard-optional">(optional)</span>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
          className="dashboard-input"
        />
      </label>
      <h3 className="dashboard-form-section">Contact & links</h3>
      <p className="dashboard-form-hint">
        Add values and turn on “Show on profile” for each item you want on your public QR page.
      </p>
      {PLATFORM_KEYS.map((key) => {
        const config = PLATFORM_CONFIG[key]
        const field = (fields as Partial<Record<string, { value: string; visible: boolean }>>)[key]
        const value = field?.value ?? ''
        const visible = field?.visible ?? false
        return (
          <div key={key} className="dashboard-field-row">
            <div className="dashboard-field-input-wrap">
              <input
                type={config.inputType}
                value={value}
                onChange={(e) => updateField(key as PlatformKey, e.target.value, visible)}
                placeholder={config.placeholder}
                className="dashboard-input"
              />
              <label className="dashboard-check">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => updateField(key as PlatformKey, value, e.target.checked)}
                />
                <span>Show on profile</span>
              </label>
            </div>
            <span className="dashboard-field-label">{config.label}</span>
          </div>
        )
      })}
      {message && (
        <p
          className={
            message.type === 'err'
              ? 'dashboard-message dashboard-message--err'
              : 'dashboard-message dashboard-message--ok'
          }
        >
          {message.text}
        </p>
      )}
      <button type="submit" disabled={saving} className="dashboard-submit">
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
