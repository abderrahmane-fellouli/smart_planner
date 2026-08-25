/**
 * ApplicationLogo.jsx — Single reusable source for the official SmartPlanner logo.
 *
 * Usage:
 *   <ApplicationLogo />                           — default 32px boxed
 *   <ApplicationLogo size={42} />                 — custom size
 *   <ApplicationLogo variant="bare" />            — no container, just the image
 *   <ApplicationLogo size={28} variant="bare" />  — small bare logo
 *
 * The boxed variant renders the logo inside a rounded rectangle
 * whose background uses the --sp-logo-bg CSS variable (theme-aware).
 * The bare variant renders only the image with no background.
 */
import React from 'react';

export default function ApplicationLogo({ size = 32, variant = 'boxed', style = {}, ...rest }) {
    const img = (
        <img
            src="/logo.png"
            alt="SmartPlanner"
            draggable={false}
            style={{
                width: variant === 'boxed' ? `${size * 0.55}px` : `${size}px`,
                height: variant === 'boxed' ? `${size * 0.55}px` : `${size}px`,
                objectFit: 'contain',
                display: 'block',
                flexShrink: 0,
            }}
            {...rest}
        />
    );

    if (variant === 'bare') return img;

    return (
        <div
            style={{
                width: `${size}px`,
                height: `${size}px`,
                background: 'var(--sp-logo-bg, #111827)',
                borderRadius: `${Math.round(size * 0.25)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                ...style,
            }}
        >
            {img}
        </div>
    );
}
