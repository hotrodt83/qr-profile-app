'use client'

import { useCallback } from 'react'
import type { PublicProfile } from '@/lib/types'
import { PLATFORM_CONFIG } from '@/lib/platforms'
import { buildVCard } from '@/lib/vcard'

type Props = {
  profile: PublicProfile
}

export default function PublicProfileView({ profile }: Props) {
  const hasContactInfo =
    profile.fields.some((f) => f.key === 'phone' || f.key === 'email')

  const addToContacts = useCallback(() => {
    const phone = profile.fields.find((f) => f.key === 'phone')?.value
    const email = profile.fields.find((f) => f.key === 'email')?.value
    const website = profile.fields.find((f) => f.key === 'website')?.value
    const vcard = buildVCard({
      displayName: profile.display_name,
      phone,
      email,
      url: website,
    })
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(profile.display_name || 'contact').replace(/\s/g, '-')}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }, [profile])

  return (
    <div className="public-profile">
      <div className="public-profile-card">
        {profile.avatar_url ? (
          <div className="public-profile-avatar-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url}
              alt=""
              width={80}
              height={80}
              className="public-profile-avatar"
            />
          </div>
        ) : null}
        <h1 className="public-profile-name">
          {profile.display_name || 'Profile'}
        </h1>
        <div className="public-profile-actions">
          {profile.fields.map(({ key, value }) => {
            const config = PLATFORM_CONFIG[key]
            const href = config.urlTemplate(value)
            const isTel = config.action === 'tel'
            const isMailto = config.action === 'mailto'
            const label =
              isTel && value
                ? 'Call'
                : isMailto
                  ? 'Email'
                  : config.label
            return (
              <a
                key={key}
                href={href}
                className="public-profile-button"
                target={config.action === 'url' ? '_blank' : undefined}
                rel={config.action === 'url' ? 'noopener noreferrer' : undefined}
              >
                {label}
              </a>
            )
          })}
          {hasContactInfo && (
            <button
              type="button"
              onClick={addToContacts}
              className="public-profile-button public-profile-button--secondary"
            >
              Add to contacts
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
