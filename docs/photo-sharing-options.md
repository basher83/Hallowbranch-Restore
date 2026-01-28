# Photo Sharing Options: Mother's Phone

Research and decision matrix for sending and receiving photos to/from mother's iPhone.

## Decision Matrix

| Solution               | Sender Friction                    | Reliability Today | Self-Hosted | Setup Complexity |
| ---------------------- | ---------------------------------- | ----------------- | ----------- | ---------------- |
| Google Photos          | Zero                               | High              | No          | Low              |
| PhotoSync + PhotoPrism | Zero (trigger-based)               | High              | Yes         | Moderate         |
| Immich (current)       | Low-Medium (open app occasionally) | Medium            | Yes         | Moderate         |
| Immich (post-PhotoKit) | Zero                               | High (expected)   | Yes         | Moderate         |

## Analysis

The iOS constraint changes the calculus. Until PhotoKit API ships (Q1-Q2 2026 estimate), all self-hosted solutions have the same fundamental iOS limitation. The differentiator is workaround quality.

### PhotoSync's Trigger Approach

PhotoSync's trigger approach is clever:

- **Geofence trigger** = "uploads when mom connects to her home WiFi"
- **Charge trigger** = "uploads when phone is plugged in at night"
- Both are invisible to her after setup—zero cognitive load

### Immich's Current State

Immich's current state requires periodic app opening. For a non-technical user, "open this app sometimes or your photos won't back up" is friction that will fail silently.

## Recommendation: Tiered Approach

### Option A: Lowest friction, not self-hosted

**Google Photos shared account.** Zero friction, HEIC quality loophole, you already validated it works.

### Option B: Self-hosted, reliable today

**PhotoSync ($5-10) → PhotoPrism on your homelab via Tailscale.** You deploy PhotoPrism, configure her phone once with WiFi geofence trigger, done. She never thinks about it.

### Option C: Self-hosted, best long-term

**Immich now**, accept current iOS limitations, upgrade experience when PhotoKit ships. Risk: mom's photos may have multi-hour delays until then.

## Trade-off Table

| Factor              | Google Photos | PhotoSync+PhotoPrism | Immich         |
| ------------------- | ------------- | -------------------- | -------------- |
| Self-hosted         | ❌            | ✅                   | ✅             |
| Zero friction today | ✅            | ✅                   | ❌             |
| No paid apps        | ✅            | ❌ ($5-10)           | ✅             |
| Future-proof        | Medium        | Medium               | High           |
| Your maintenance    | None          | PhotoPrism updates   | Immich updates |

## Conclusion

Given your stated preference for simplicity over architectural consistency, **Google Photos is still the pragmatic winner**—unless self-hosting is a hard requirement for privacy/principle reasons.

If self-hosting matters:

- **PhotoSync + PhotoPrism** is the reliable path today.
- **Immich** is the better long-term bet but has friction until PhotoKit ships.
