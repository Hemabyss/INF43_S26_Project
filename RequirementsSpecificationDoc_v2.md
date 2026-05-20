# Squad Seeker — Requirements Specification

**Team Members:**
- Anna Lee - chaeeul3
- Manas Kottakota - kottakom
- Nikash Malhotra - nikashm
- Tanmay Garg - tanmayg1
- Jared Yrastorza - jryrasto

---

## Executive Summary

Squad Seeker is a mobile app designed to help people find others nearby who share their interests in real time. The app is designed for active environments like universities and public parks, bridging the gap between online interests and real-world connection.

The app's main goal is to make social discovery a more natural, safe, and interest-driven process. Unlike dating or networking apps, Squad Seeker connects people through shared interests, removing the pressure of cold outreach by grounding every interaction in both mutual proximity and shared interest.

The central feature is interest-based proximity matching — users select interest categories and are notified when others with a common interest enter a predetermined geographic range. Strangers see only aggregated count bubbles on the map rather than individual pins; mutual friends with precise location sharing enabled can see each other's exact position for a user-specified time window. Location blackout zones allow users to permanently hide their presence in private areas such as their home. Chat is gated behind shared interests and proximity. Structured user bios with predefined tags simplify moderation and reduce abuse. Lightweight map-pinned events allow users to signal planned activities to nearby interest subscribers. A dedicated Interests tab enables browsing and managing subscriptions after onboarding.

Squad Seeker's primary risks center around privacy and safety. Location sharing inherently creates stalking and surveillance potential, which the app mitigates through hard range caps, symmetric visibility rules, blackout zones, and automatic location expiry. GPS accuracy degradation in urban environments may reduce the reliability of proximity alerts. User adoption density is a critical dependency — the app's value scales directly with local user count, meaning early-stage deployment in low-density areas may limit perceived utility. Content moderation at scale, particularly for profile photos and chat messages, requires a combination of automated filtering and human review.

---

## Application Context & Environmental Constraints

### Physical Operating Environment
Squad Seeker is designed for use in dense, high-activity urban and suburban environments such as university campuses (e.g., UC Irvine), public parks, and city centers. The app is intended for users who are physically moving or stationary in public or semi-public spaces, and must function reliably while a user is walking, biking, or sitting in indoor locations like libraries or coffee shops. While globally accessible via the App Store, the app's utility is constrained by local user density and is most effective in areas where interest ranges (e.g., 2–10 miles) contain a high probability of other active users.

### Hardware & Software Platforms
- **Primary Device:** Apple iPhone
- **Platform Requirements:** iOS (current or previous major version), leveraging standard iOS interface conventions
- **Input/Output:** Multi-touch screen, haptic feedback for notifications, high-resolution display for maps and profiles

### System Dependencies & Interactions
- **GPS:** Heavily dependent on GNSS capabilities for high-precision location data to facilitate overlapping range and visibility radius features (500–1200 ft)
- **Network Connectivity:** Persistent LTE/5G or Wi-Fi connection required for real-time location sync and push notifications
- **OS Privacy Frameworks:** Requires iOS location permissions ("Always" or "While Using"); core functionality becomes dormant if denied
- **Power Management:** Must operate within iOS background activity limits to prevent excessive battery drain during long sessions
- **Map Services:** Interacts with system-level mapping data (e.g., Apple Maps) to render Blackout Zones and interest-based geofences

### Environmental Constraints
- **Signal Integrity:** GPS drift may occur in high-density urban areas (urban canyons) or reinforced concrete structures, temporarily affecting proximity alert accuracy
- **Usage Limitations:** The app will intentionally cease location broadcasting if a user enters a pre-defined Blackout Zone, regardless of hardware capability

---

## Functional Requirements

### Range System
- Range is set per-interest rather than per-user, with hard caps per interest category (e.g., Bowling: 2mi, Bicycle Touring: 30mi), adjusted over time using user heuristics
- Hard range caps enforce locality, reduce surveillance risk, ensure symmetric consent between users, and preserve battery life
- Users can see a general location (~500–1200 ft accuracy) of others subscribed to the same interest
- Users see only profile pictures, usernames, and bios of non-friend users within the same interest range
- Mutual friends may share precise location with each other for a fixed time window; see Precise Location Time-Window Sharing below

### Interest Subscriptions
- Users may subscribe to multiple interests; there is no cap on simultaneous subscriptions
- Per-interest notification settings: mute, digest, or live; managed inline from the Interests tab
- Users may only see interests they share in common with others (e.g., a user subscribed to #bikers cannot see another user's #LGBT tag unless both are subscribed to it)
- Interests may be marked public, private, or visible to specific friends only; default is friends only

### User Bios
- Structured bio fields: profile photo, highlighted interests (public visibility), experience level, and predefined tags/phrases (e.g., "LFG", "Open Availability", pronouns)
- No free-form text fields to reduce moderation complexity and abuse potential
- Automated first-pass moderation on profile photos to detect nudity, slurs, threats, and PII; human review panel for flagged content; appeals process for bans and suspensions

### User Blocking
- Blocking is per-person, not per-interest
- On block, both users are completely hidden from each other without notification to either party
- The blocking user receives a proximity warning overlay when within 100 ft of a blocked user ("You are within 100 ft of someone you've blocked")
- Mutual friends (C/D) may still interact with both A and B independently without either blocked party being made aware
- First-In policy for group chats: if User A is already in a group chat and User B (who A has blocked) is invited, B's join attempt is silently prevented with a generic error ("Failed to add user to group chat")

### Location Sharing & Blackout Zones
- Session-based location sharing: location is broadcast on app open and auto-expires after 1 hour
- Blackout zones prevent discovery at all times within a user-defined radius
- The app automatically prompts users to add a blackout zone if they are consistently detected at the same location overnight across 3 or more consecutive nights
- Users may add additional blackout zones by dropping pins on a map with a specified radius; GPS coordinates are stored, not street addresses
- Blackout zones take precedence over all other location sharing features, including precise location time-window shares

### Precise Location Time-Window Sharing

Precise location sharing is an opt-in feature that allows a user to share their exact GPS position with one or more mutual friends for a fixed time window. It is always initiated by the sharer, never requested by the recipient.

**Initiating a Share**
- Precise location sharing may be initiated from two entry points: tapping a mutual friend's pin on the map (profile card → "Share My Location"), or from the chat toolbar in an active conversation with a mutual friend
- Tapping "Share My Location" opens a configuration sheet with a recipient selector and a duration selector
- The recipient selector supports individual mutual friends, named circles (groups of mutual friends), or a combination of both
- The duration selector offers four fixed options: 1 hour, 2 hours, 4 hours, or 8 hours; no custom duration is supported in V1
- Confirming the share immediately begins broadcasting precise coordinates to the selected recipients and starts the countdown timer

**Circles**
- Circles are named groups of mutual friends created and managed from the profile settings screen (e.g., "Hiking Friends," "Classmates")
- Sharing with a circle grants access to all current circle members for the selected duration; members added after the share starts do not receive access retroactively
- Circle management (create, rename, add/remove members, delete) is handled from profile settings, not from the sharing flow

**Recipient Experience**
- Each recipient receives a push notification when sharing begins: "[Username] is sharing their precise location with you for [duration]"
- The sharer's pin on the recipient's map transitions to an exact GPS-accurate pin for the duration of the share
- Recipients receive no notification when the share expires; the pin reverts silently

**Active Share Indicator**
- While a share is active, a persistent indicator is shown on the sharer's own map screen showing how many people or circles have access
- Tapping the indicator opens a summary sheet listing each active share by recipient or circle name, duration selected, and time remaining
- The sharer may cancel any individual share early from this sheet; cancellation is immediate and silent to the recipient

**Share Expiry**
- When a time window expires, the sharer receives a notification: "Your precise location share with [name or circle] has ended"
- Multiple simultaneous expiries are consolidated into a single notification
- Blackout zones take precedence: if the sharer enters a blackout zone while a share is active, their precise pin is immediately hidden from all recipients; the share timer continues and does not pause

### User Interactions
- **Strangers (no shared interests):** May search each other by username only; cannot message or send friend requests
- **Mutual Interest (not friends):** Both users must be within the overlapping range of a shared interest to directly initiate chat or send a friend request; if either is outside range, the initiating message is forwarded to a separate inbox
- **Mutual Friends (with shared interest):** May initiate chat regardless of proximity

### Chat
- Block and report available within the chat window
- Message filtering for slurs, threats, and unsolicited intimate imagery (default ON; can be disabled in Settings > Safety)
- Rate limiting to prevent spam
- Edited messages are watermarked
- Text-only messaging for the first 7 days of mutual friendship
- First messages can only be sent between users subscribed to the same interest
- Geofenced chats: if either non-friend user exits the range of the mutual interest, chat is suspended unless both parties opt to keep it active

### Events & Activity Markers

Events are lightweight map pins that allow any user to signal that an activity will take place at a specific location and time. They are not structured meetups — there is no formal RSVP system, capacity limit, or host management interface.

**Event Creation**
- Any user may create an event, provided they are subscribed to the interest the event is tagged under
- Event creation is rate-limited on a sliding scale: users may create a maximum of 3 events per 7-day rolling window; attempts beyond this limit are rejected with an informative error
- Each event requires: a title, a scheduled date and time, a location (set by dropping a pin on the map or via the long-press context menu), and a primary interest tag drawn from the creator's active subscriptions
- Events may be designated as public (visible to all users subscribed to the tagged interest within that interest's range cap) or private (visible only to users explicitly invited by the creator)
- The creator may cancel and remove their event at any time

**Event Visibility on the Map**
- Public events appear as interest-tagged pins on the map for all users subscribed to the same interest and within the interest's range cap
- Private events appear only to invited users, regardless of interest subscription or proximity
- A user's blackout zones apply to events: if an event is located within a user's blackout zone, that user's attendance and location are not visible to other attendees or the host, and the event pin is hidden from that user's map view
- Event pins display the event title, scheduled time, interest tag, and optional attendee count; tapping opens the event detail view

**Event Expiry**
- Events auto-expire 2 hours after their scheduled start time and are automatically removed from the map
- The creator may manually remove an event at any time; removal is immediate for all viewers
- Both auto-expiry and manual removal terminate new-user access to the event detail view; existing attendees retain access to the event chat

**Attendance Signal (Optional RSVP)**
- Users may optionally tap "I'm going" on any event they can see; this is not required to attend in person
- RSVP status and attendee count are visible to all users who can view the event
- RSVP is entirely optional, consistent with the app's broader privacy defaults
- Users may withdraw their RSVP at any time before event expiry

**Event Chat**
- An event chat is automatically created for each event and is accessible to users who have RSVP'd or been explicitly invited (for private events); the host is always a member
- Event chat inherits all safety rules from proximity chat: message filtering, rate limiting, edited message watermarks, and the 7-day text-only restriction for non-mutual-friends all apply
- Block relationships are enforced in event chat, consistent with the First-In policy
- When an event expires or is manually removed, the event chat converts to a persistent group chat for all attendees at that time; no new users may join after expiry

### Onboarding

**Onboarding Sequence**

The onboarding flow proceeds in the following order:
1. Welcome screen with Sign in with Apple, Sign in with Google, or email/password account creation
2. Optional skippable explainer
3. Username selection
4. Interest selection
5. Permissions screen (location + notifications)
6. Main map screen

**Account Creation**
- Users may create an account via Sign in with Apple, Sign in with Google, or email and password
- Email/password accounts require email verification before proceeding; unverified accounts cannot advance past the welcome screen
- Sign in with Apple and Sign in with Google complete verification through the respective OAuth flow; no additional verification step is required
- Usernames must be unique, between 3 and 30 characters, and may contain letters, numbers, underscores, and hyphens only
- Profile photo, experience level, pronouns, and other bio fields are optional at signup and may be completed later from profile settings
- If a user attempts to sign in with Google using an email address already registered via email/password, the accounts are merged into a single account under the existing credentials

**Optional Explainer**
- After account creation, users are shown a brief 3–4 screen visual explainer covering: what proximity matching is, what strangers can and cannot see, and how blackout zones work
- The explainer is skippable via a clearly visible "Skip" control; users who skip land directly on username selection
- The explainer is shown only once per account, on first install; returning users do not see it again

**Interest Selection**
- Users are presented with a curated list of approximately 20–30 popular interests and must select at least one before proceeding
- A search bar is available above the curated list to find interests not in the default set
- A "Continue" button becomes active once at least one interest is selected
- Interests selected during onboarding may be adjusted at any time from the Interests tab after onboarding

**Permissions Screen**
- After interest selection, users are shown a single dedicated permissions screen that requests both location and notification access together
- The screen displays a plain-language explanation of why each permission is needed before the iOS system dialogs fire
- Location permission is requested at the "Always Allow" level with an explanation of why background access is needed; users who grant only "While Using" are informed that proximity alerts will only fire while the app is open
- Notification permission is requested immediately after location; users who deny are informed that alerts will only be visible when they open the app manually
- Both permissions may be denied without blocking progress; consequences of denial are shown inline before the system dialogs fire

**Denied Location Permission — Degraded Map State**
- Users who deny location permission proceed to the map screen in a degraded state: map tiles render, but no nearby users, interest pins, or event pins are displayed
- A persistent non-dismissible banner reads "Location access is off — enable it in Settings to find people nearby" with a deep-link button to iOS Settings
- All features unrelated to live location (profile editing, interest management, chat with existing mutual friends) remain fully accessible

**Returning Users and Resume Behavior**
- A fully set-up returning user (username set, at least one interest selected) lands directly on the main map screen after re-authenticating; no onboarding screens are shown
- A partially set-up user (account created but interest selection not completed) resumes at the interest selection step on next open; credentials and username are preserved, but interest selection restarts
- A user who has not yet created an account sees the welcome screen on app open

### Map View

The map screen is the primary surface of Squad Seeker. It renders continuously while the app is foregrounded and reflects the user's live position, nearby matches, active interests, event pins, and blackout zones.

**User's Own Position**
- The user's own position is always shown as a distinct avatar pin using their profile photo or a default placeholder
- The pin does not move relative to the viewport as the user pans; a recenter control re-centers the map on the user's position
- The user's own pin is never visible to other users; it is a local UI element only

**Stranger Representation — Count Bubbles**
- Nearby non-friend users are aggregated into interest-labeled count bubbles, not individual pins
- Each active interest with at least one nearby subscriber within range displays a count bubble at the k-anonymized centroid of those users' positions (e.g., "3 hikers nearby")
- Bubbles with fewer than 2 contributors are suppressed to prevent single-user de-anonymization
- Toggling an interest off in the filter hides its count bubble regardless of whether matches exist
- Tapping a count bubble opens a bottom sheet listing anonymized profiles; from this sheet the user may view a profile or initiate chat or a friend request if proximity requirements are met

**Mutual Friend Representation — Individual Pins**
- Mutual friends with active precise location sharing appear as individual avatar pins at their exact position
- A friend's pin shows their profile photo and color-coded interest badges (up to 3, with a "+N" overflow indicator)
- Tapping a friend's pin opens their profile card with quick access to chat

**Multiple Shared Interests — Color Coding**
- Each subscribed interest is assigned a consistent color from a fixed accessible palette (WCAG-compliant) at session start; interest labels always accompany color coding and are never color-only
- Stacked color-coded badges on friend pins represent each shared interest, up to 3 visible with "+N" overflow

**Event Pins**
- Public event pins for subscribed interests appear as distinct shapes (differentiated from user pins) showing title and scheduled time on tap
- Private event pins are visible only to invited users
- Event pins within the user's blackout zone are hidden from their map view

**Blackout Zone Overlay**
- Active blackout zones are rendered as semi-transparent shaded overlays, visible only to the user themselves and never transmitted to other users
- Overlays are rendered client-side only; the server stores GPS coordinate and radius only
- Tapping an overlay opens options to view, edit, or remove the zone
- When the user is inside their own blackout zone, their avatar pin shows a distinct visual indicator (e.g., lock icon overlay) communicating that they are not visible to others

**Map Controls**
- **Interest filter:** a horizontally scrollable row of interest tags allows toggling individual interest layers on or off
- **Friends-only toggle:** hides all count bubbles and shows only mutual friend pins
- **Recenter control:** re-centers the map viewport on the user's current position
- **Long-press context menu:** a long-press anywhere on the map opens a context menu with "Create Event here," pre-populating the event creation form with the tapped coordinates

**Empty and Degraded States**
- When no nearby matches exist, the map renders normally with the user's own position centered and no empty state message
- When location permission is denied: map tiles render, user pin is not shown, all match pins and bubbles are hidden, and the persistent banner from the Onboarding section is shown

### Interest Discovery & Management

The Interests tab is a dedicated bottom navigation destination where users browse the full interest catalog, subscribe to new interests, and manage visibility and notification settings for existing subscriptions.

**Interests Tab Structure**
The tab contains three sections in order:
- **My Interests** — current subscriptions with inline management controls
- **Popular Near You** — interests with the highest active subscriber counts within the user's current location, recalculated on each tab open; hidden when location permission is denied
- **Browse by Category** — the full catalog organized into top-level categories (e.g., Sports, Music, Outdoors, Food, Arts, Games, Technology); tapping a category shows a flat alphabetical list of interests within it

A persistent search bar at the top searches across the full catalog regardless of category.

**Browsing and Subscription**
- Tapping an unsubscribed interest opens a detail screen showing: interest name, category, hard range cap, and a relative activity indicator for interests surfaced in Popular Near You only ("High activity near you," "Low activity near you"); the full catalog shows no activity indicators
- A "Subscribe" button on the detail screen confirms subscription with default settings: friends-only visibility, live notifications
- There is no cap on the number of simultaneous interest subscriptions

**My Interests — Inline Management**
- Each subscribed interest row shows the interest name, a visibility indicator icon (public / friends-only / private), and a notification mode indicator (live / digest / muted)
- Tapping either indicator inline cycles through its states without navigating away
- A swipe-left gesture reveals an "Unsubscribe" action; confirming immediately removes the interest from the user's subscriptions, removes its count bubble from the map, and removes the user from that interest's discoverable pool

**Popular Near You**
- Shows interests with meaningful local activity using relative labels only ("High activity," "Moderate activity"), not exact subscriber counts
- Already-subscribed interests are not shown in this section
- If the user is inside a blackout zone when the tab opens, Popular Near You is calculated based on the blackout zone's center coordinate rather than the user's precise position
- Sensitive interest categories (e.g., mental health, identity-related, religious interests) are excluded from Popular Near You to prevent demographic inference from local activity patterns

**Interest Catalog and Categories**
- The catalog is organized into a fixed set of developer-maintained top-level categories; new categories and interests may be added over time but are not user-definable in V1
- Each category displays its interest count; interests within categories are listed alphabetically

### Notification Anatomy

All notifications are delivered via APNs. The default content level is full detail — username, interest, and context are shown in the notification body. Users may reduce to generic messages via Settings > Notifications > Show Previews.

**Notification Preference Structure**

Settings > Notifications contains individual on/off toggles for:
- Proximity alerts
- Friend requests
- Chat messages
- Range exit warnings
- Blackout zone suggestions
- Precise location share alerts
- Event alerts

Per-interest notification settings (live / digest / muted) in the Interests tab act as a secondary filter on top of the global proximity alert toggle.

**Proximity Alert**
- *Copy:* `[N] people near you share your interest in [interest]`
- *Batching:* Multiple interests triggering within 60 seconds are consolidated: `People near you share your interests in [interest 1], [interest 2], and [interest 3]`
- *Deep link:* Map centered on the relevant interest's count bubble with that interest's filter active
- *Suppression:* Not fired if the user is in a blackout zone; not fired for muted or digest interests

**Friend Request**
- *Copy:* `New friend request from [Username] (#[interest])`
- *Deep link:* Sender's profile card with Accept and Decline actions inline
- *Note:* If the sender has friends-only profile visibility, their profile photo is omitted from the notification

**Chat Message**
- *Copy (mutual friend):* `[Username]: [message preview, max 60 characters]`
- *Copy (mutual interest, not yet friends):* `[Username] (via #[interest]): [message preview, max 60 characters]`
- *Deep link:* Relevant chat thread
- *Batching:* Multiple messages from the same sender within 60 seconds are collapsed into one notification; different senders generate one notification each
- *Suppression:* Not fired if the relevant chat thread is already open and foregrounded

**Range Exit Warning**
- *Copy:* `Your chat with [Username] has been paused — you've left the [interest] range. Tap to keep it going.`
- *Deep link:* Suspended chat thread with opt-in continuation prompt visible
- *Note:* Fires for both the user who exited and the user who remained in range

**Blackout Zone Suggestion**
- *Copy:* `You're often here at night. Add a blackout zone to keep this location private?`
- *Deep link:* Blackout zone creation screen with map pin and default radius pre-filled
- *Frequency cap:* Fires at most once per detected cluster; does not re-fire for 30 days after dismissal; never re-fires for permanently dismissed clusters
- *Note:* Detected coordinate is not shown on the lock screen; revealed only after the user opens the app

**Precise Location Share — Share Started (recipient)**
- *Copy:* `[Username] is sharing their precise location with you for [duration]`
- *Deep link:* Map with the sharer's exact pin centered in the viewport

**Precise Location Share — Share Expired (sharer only)**
- *Copy (single):* `Your precise location share with [Username] has ended`
- *Copy (circle):* `Your precise location share with [circle name] has ended`
- *Copy (consolidated):* `Your precise location shares with [Username] and [N] others have ended`
- *Deep link:* Location Sharing management sheet on the map screen

**Event — New Nearby Event**
- *Copy:* `New [interest] event near you: [event title] at [time]`
- *Deep link:* Event detail screen
- *Suppression:* Not fired if the user is in a blackout zone or has the tagged interest muted

**Event — Starting Soon (RSVP'd users only)**
- *Copy:* `[Event title] starts in 30 minutes`
- *Deep link:* Event detail screen

**Event — Private Invitation**
- *Copy:* `[Username] invited you to a private event: [event title] at [time]`
- *Deep link:* Event detail screen with RSVP options visible

**Blocked User Proximity Warning**
- *Copy:* `Heads up — someone you've blocked is nearby`
- *Deep link:* Map centered on the user's own position; no indication of the blocked user's direction or precise position
- *Note:* Username intentionally omitted from notification copy to avoid confirming identity on the lock screen in a potentially unsafe situation

---

## Functional Requirements Analyses

### 1. Range-Based Notifications (User-Specified vs. Fixed)
**Decision:** Range is fixed per-interest category rather than user-defined.

**Pros:**
- Eliminates asymmetric visibility (User A seeing User B without B seeing A), which would otherwise create surveillance opportunities
- Simplifies the matching logic and reduces server-side computation
- Ensures all users within an interest have equal discovery conditions, making the system fairer and more predictable
- Reduces stalking risk by preventing users from setting arbitrarily large ranges to track others

**Cons:**
- Removes user autonomy — someone in a rural area may want a larger range for a niche interest but cannot override the cap
- A single hard cap per interest may not account for regional density differences (e.g., a 2mi cap in a dense city vs. a rural town)
- Users may feel restricted if the preset range for their interest doesn't match their expectations

**Ethical Concerns:**
- Fixed ranges prevent bad actors from exploiting asymmetric range settings to surveil specific individuals without their knowledge, which is a significant safety benefit
- Predetermined ranges carry implicit assumptions about how interests are practiced geographically, which may reflect the biases of whoever sets them

---

### 2. Multiple Interest Subscriptions
**Pros:**
- Increases the probability of finding nearby matches by expanding the number of active discovery channels
- Reflects the reality that people have multiple hobbies and social identities
- Encourages broader app engagement and session depth
- Per-interest notification controls give users granular management over their experience

**Cons:**
- Users subscribed to many interests may receive excessive notifications, leading to notification fatigue
- More interests increase the surface area for unintended information disclosure (e.g., a combination of niche interests could de-anonymize a user)
- Moderation complexity scales with the number of interest categories

**Ethical Concerns:**
- Subscribing to sensitive interests (e.g., mental health groups, political affiliations, religious identities) creates a risk of involuntary outing if interest visibility is not carefully controlled
- The interest privacy system (users only see shared interests) mitigates this, but implementation gaps could expose sensitive data

---

### 3. Structured User Bios
**Pros:**
- Predefined fields and tags are far easier to moderate automatically than free-form text
- Reduces the ability of bad actors to embed threats, slurs, or contact information in their profile
- Creates a consistent profile format that makes it easier for users to quickly assess compatibility
- Reduces cognitive load for users who find blank profiles intimidating to fill out

**Cons:**
- Predefined tags may not capture the full range of how users want to express themselves, leading to a less personal experience
- Users who want nuanced self-expression may find the format limiting compared to free-form bios on other platforms
- Tag categories must be actively maintained and expanded to remain culturally relevant

**Ethical Concerns:**
- Predefined pronoun and identity tags could be perceived as both inclusive and limiting depending on whether the available options reflect the diversity of users
- Automated photo moderation systems carry known false positive and false negative rates, risking unfair account suspension for legitimate users, particularly those from underrepresented groups

---

### 4. User Blocking
**Pros:**
- Blocking at the person level (not per-interest) prevents a blocked user from re-encountering the blocker through a different shared interest
- Silent blocking (no notification) protects the blocking user from retaliation
- The proximity warning overlay gives the blocking user actionable situational awareness without revealing the block to the blocked party
- The First-In group chat policy prevents blocked users from being introduced into shared social spaces

**Cons:**
- Silent blocking may cause confusion for the blocked user who notices they can no longer interact with someone without explanation
- The First-In group chat policy could be exploited — a bad actor could block someone preemptively to prevent them from joining a group
- Proximity warnings only go to the blocker, not to mutual friends who may inadvertently facilitate contact

**Ethical Concerns:**
- The asymmetry of information (blocker knows, blocked does not) is intentional for safety but could create social tension in tight-knit communities
- The system does not prevent a blocked user from encountering the blocker in person; the warning overlay addresses awareness but not physical safety

---

### 5. Location Sharing Limits & Blackout Zones
**Pros:**
- Session-based expiry (1 hour) minimizes passive surveillance by ensuring location is never shared indefinitely without active user intent
- Blackout zones give users precise control over where they are never discoverable, critical for protecting home addresses
- Automatic overnight detection and blackout zone prompting reduces the burden on users to manually configure privacy settings
- Storing GPS coordinates rather than street addresses reduces the sensitivity of stored data

**Cons:**
- Automatic overnight location detection requires continuous background location access, which may feel invasive
- Users who travel or have irregular schedules (e.g., shift workers) may receive frequent and irrelevant blackout zone prompts
- A 1-hour session expiry may be too short for users engaging in long outdoor activities who want to remain discoverable

**Ethical Concerns:**
- The app must balance the utility of persistent location awareness against the fundamental right to not be tracked; the 1-hour expiry and blackout zones are key mitigations but must be prominently communicated to users
- Storing location data on servers, even as GPS coordinates, creates a data breach risk that could expose user movement patterns

---

### 6. Geofenced Chats
**Pros:**
- Encourages genuine in-person connection by tying chat availability to physical proximity
- Reduces the app's use as a generic messaging platform, keeping interactions grounded in shared real-world context
- Provides a natural, low-friction way to end interactions that were purely transient
- The opt-in to continue chat after leaving range gives users agency over which connections to maintain

**Cons:**
- Suspending chat mid-conversation due to range exit can feel abrupt, particularly in edge cases like brief GPS drift
- Users may not realize their chat has been suspended, leading to unanswered messages and confusion
- Creates a barrier for users who connected in person and want to continue the conversation later from home

**Ethical Concerns:**
- Geofencing chat creates implicit pressure to remain in a physical area to maintain a conversation, which could be exploited to coerce someone into staying somewhere they wish to leave
- Post-incident communication may be blocked if users have left the range and not opted in to continue

---

### 7. First-In Group Chat Policy
**Pros:**
- Prevents blocked users from being introduced into shared group social spaces, protecting the blocking user's sense of safety
- The generic error message prevents the blocked user from knowing they were excluded by a block rather than a technical issue
- Requires no action from the blocking user — protection is automatic

**Cons:**
- The policy can be gamed by a bad actor who blocks someone preemptively to exclude them from group chats
- Mutual friends may not understand why a user cannot be added, causing social friction with no explanation available
- Does not handle the case where the blocked user joins a group first — the blocking user would then be the one excluded

**Ethical Concerns:**
- The silent exclusion operates without transparency to any party other than the system, raising questions about fairness in shared social spaces
- Group chat dynamics in real-world friend networks are complex; a binary block-based exclusion policy may not map cleanly onto nuanced social relationships

---

### 8. Events & Activity Markers
**Pros:**
- The lightweight pin model keeps Events consistent with the app's ambient-discovery design language — an event is a structured version of "I will be here," not a separate product surface
- The sliding-scale rate limit prevents spam without imposing a rigid per-event cooldown that would frustrate legitimate organizers running frequent activities (e.g., a daily running group)
- Optional RSVP respects the privacy defaults established elsewhere in the spec while still giving organizers a useful signal about expected turnout
- Blackout zone enforcement on events ensures the event system cannot be used to circumvent location privacy preferences

**Cons:**
- The absence of capacity limits means a popular public event could attract more attendees than the host intended with no mechanism to close it
- The sliding-scale rate limit requires server-side tracking of per-user event creation history, adding modest backend complexity
- Persisting the event chat indefinitely after expiry means the system accumulates group chats that may never be used again; a cleanup policy (e.g., archive after 90 days of inactivity) should be considered

**Ethical Concerns:**
- Public events tied to sensitive interest tags (e.g., mental health support groups, religious gatherings) are discoverable by any interest subscriber within range; users should be reminded of this when creating a public event under a sensitive tag
- The optional RSVP model means attendance counts may significantly underrepresent actual turnout, which could mislead users assessing whether an event is worth attending; this is an acceptable trade-off given the privacy benefit

---

### 9. Onboarding
**Pros:**
- Front-loading the privacy explainer before the permissions request gives users context that improves permission grant rates compared to asking cold
- Making profile photo optional at signup removes a common drop-off point
- The curated interest list with search gives new users a fast path to selecting something familiar while leaving room for niche interests
- The degraded map state keeps denied-permission users in the app with a clear, low-friction path to fixing the issue

**Cons:**
- Supporting three account creation methods (Apple, Google, email) increases authentication surface area and requires handling edge cases such as duplicate-email account merging
- The "Always Allow" location permission request during onboarding may feel aggressive before the user has experienced the app's value
- Restarting interest selection on resume accepts some UX cost in exchange for simpler state management

**Ethical Concerns:**
- Requesting location at "Always Allow" level before the user has experienced the app requires especially clear justification; the explanation must not obscure that "While Using" is a valid alternative
- The optional explainer must be genuinely informative rather than a superficial trust-building exercise; understating stranger visibility undermines informed consent

---

### 10. Map View
**Pros:**
- Count bubbles solve two problems simultaneously: protecting individual stranger privacy and preventing map clutter in high-density areas
- Client-side-only blackout zone rendering ensures zone boundaries are never transmitted to the server in rendered form
- The long-press event creation gesture ties event location to a deliberate, spatially-aware action
- The friends-only toggle gives users a low-friction way to use the map purely as a friend-locator

**Cons:**
- Count bubble centroid positioning using k-anonymized data may place the bubble in a visually misleading location if users are distributed unevenly
- Color assignment from a fixed palette may produce low-contrast combinations for users with color vision deficiencies; interest labels must always accompany color coding
- The long-press event creation gesture is not discoverable without a tooltip or explainer

**Ethical Concerns:**
- A count bubble of "1" combined with a niche interest effectively pinpoints a single individual; the minimum contributor threshold of 2 mitigates but does not fully eliminate this risk in very low-density scenarios

---

### 11. Precise Location Time-Window Sharing
**Pros:**
- Sharer-initiated sharing is consistent with the consent model throughout the spec — location is always shared outward by choice, never pulled inward by request
- Fixed duration options reduce decision fatigue and eliminate the risk of accidentally setting an indefinitely long share
- The persistent map indicator ensures the sharer always has passive awareness that sharing is active
- Blackout zone precedence ensures the user's most privacy-protective setting always wins

**Cons:**
- The absence of a recipient-initiated request model means a user who wants to share must remember to initiate it; friends cannot prompt the share without asking via chat
- Circles require upfront setup; new users or those with small networks may find the feature irrelevant until their network grows
- The share timer continuing inside blackout zones means a user who spends time in a blackout zone loses sharing time they intended to give a friend

**Ethical Concerns:**
- Precise GPS sharing, even time-limited, is a meaningful increase in surveillance potential; the fixed duration options and automatic expiry are critical mitigations; the feature should be clearly labeled as sharing exact location, not approximate
- Circle-based sharing means a single tap can broadcast precise location to multiple people simultaneously; the confirmation sheet must clearly display how many people will receive access before the user confirms

---

### 12. Interest Discovery & Management
**Pros:**
- Showing the range cap on the interest detail screen before subscription sets accurate expectations; a user in a rural area can see whether a range cap is likely to yield matches before subscribing
- Inline visibility and notification toggles minimize management friction for users with many subscriptions
- Limiting activity indicators to the Popular Near You section avoids creating a two-tier catalog where low-activity interests feel illegitimate
- Excluding sensitive categories from Popular Near You prevents demographic inference from local activity patterns

**Cons:**
- The absence of a subscription cap means a user could subscribe to every interest in the catalog, generating constant notifications; muting is available but relies on user initiative
- Category-based browsing requires a well-maintained taxonomy; poorly categorized or missing interests will send users to search, which requires knowing what to search for
- Relative activity labels ("High," "Moderate") may feel imprecise to users who want to know whether an interest has 3 local subscribers or 300

**Ethical Concerns:**
- The Popular Near You section aggregates local subscriber activity, which in small or homogeneous communities could surface sensitive information about local demographics even with relative labels; excluding sensitive categories partially mitigates this but does not eliminate it
- The blackout-zone-aware Popular Near You calculation (using the zone center rather than the user's precise position) requires the backend to handle a non-trivial coordinate substitution; implementation gaps could inadvertently expose the user's precise position through the interests surfaced

---

### 13. Notification Anatomy
**Pros:**
- Consistent copy patterns across notification types make notifications scannable and predictable
- Batching and consolidation of proximity alerts and precise share expiry notifications reduces notification fatigue for active users
- The blocked user proximity warning deliberately omits the blocked user's username, which in a potentially threatening physical situation is a meaningful safety decision
- The blackout zone suggestion frequency cap prevents nagging users who have consciously chosen not to add a zone

**Cons:**
- Full detail by default means chat message previews and usernames are visible on the lock screen to anyone who picks up the user's phone; users who care about lock screen privacy must actively change this in Settings
- The 30-minute pre-event reminder is hardcoded; users who want a longer or shorter lead time have no way to adjust in V1
- Consolidated proximity notifications deep-link to the map without specifying which bubble to center on when multiple interests triggered simultaneously, which may be slightly disorienting

**Ethical Concerns:**
- Chat message previews on the lock screen by default are a meaningful privacy exposure; the Settings > Notifications > Show Previews option must be clearly surfaced during onboarding or via a first-notification tooltip, not buried
- The precise location share start notification reveals to the recipient that the sharer is currently active; in cases of interpersonal conflict this could be used to infer activity patterns during the share window; fixed durations and sharer-only cancellation mitigate but do not eliminate this

---

## Use Cases

### Interest-Based Matching
- **Basic Flow:** User selects an interest → app shows nearby users within range → user views profiles → sends friend request
- **Alternative Flow:** User sees no nearby users → subscribes to another interest → finds matches
- **Exceptional Flow:** Location permissions off → app prompts user to enable → no results shown until enabled

### Range-Based Discovery
- **Basic Flow:** User subscribes to an interest → enters range of another subscribed user → receives notification of nearby match
- **Alternative Flow:** User has muted notifications → sees matches only when opening app manually
- **Exceptional Flow:** User is outside range → cannot see or initiate interaction with matches

### Onboarding
- **Basic Flow:** User downloads app → completes account creation → skips explainer → selects interests → grants location and notification permissions → reaches map screen
- **Alternative Flow:** User denies location permission → proceeds to map in degraded state → enables location later from Settings banner
- **Exceptional Flow:** User quits mid-onboarding after username selection → returns to app → resumes at interest selection with credentials preserved

### Profile / Bio Interaction
- **Basic Flow:** User creates structured bio → other users view profile → decide to connect
- **Alternative Flow:** User sets bio to friends-only → only mutual friends can view full profile
- **Exceptional Flow:** Profile photo flagged by automated moderation → profile temporarily hidden pending human review

### Chat Between Users
- **Basic Flow:** Two users share an interest and are within range → initiate chat → continue messaging
- **Alternative Flow:** One user leaves range → chat moves to suspended state → both are notified with option to opt in to continue
- **Exceptional Flow:** User sends a message containing a slur → message blocked → warning shown to sender

### Blocking & Safety
- **Basic Flow:** User blocks another → both profiles and messages are hidden from each other silently
- **Alternative Flow:** Blocked user enters within 100 ft of blocker → blocker receives proximity warning overlay
- **Exceptional Flow:** Blocked user is invited to a group chat the blocker is already in → join attempt silently fails with generic error

### Location Sharing Controls
- **Basic Flow:** User opens app → location begins sharing → auto-expires after 1 hour of inactivity
- **Alternative Flow:** User enters a blackout zone → location sharing suspended automatically regardless of session state
- **Exceptional Flow:** App detects user consistently at same location overnight → prompts user to designate as blackout zone

### Precise Location Time-Window Sharing
- **Basic Flow:** User taps a mutual friend's pin → opens profile card → taps "Share My Location" → selects duration → friend receives notification and sees exact pin on their map
- **Alternative Flow:** User initiates share from active chat toolbar → selects a circle instead of individual friend → all circle members receive notification
- **Exceptional Flow:** Sharer enters a blackout zone mid-share → precise pin hidden from recipients silently → reappears when sharer exits the zone; share timer continues throughout

### Interest Discovery & Management
- **Basic Flow:** User opens Interests tab → browses Popular Near You → taps an interest → views range cap and activity level → subscribes → interest appears in My Interests with default settings
- **Alternative Flow:** User searches for a niche interest not in the curated list → finds it → subscribes → adjusts visibility to private inline from My Interests
- **Exceptional Flow:** User attempts to create a public event under a sensitive interest category → app displays reminder that event is discoverable by all interest subscribers within range before confirming

### Events / Activity Marker
- **Basic Flow:** User long-presses a location on the map → taps "Create Event here" → fills in title, time, interest tag → publishes → event pin appears for nearby interest subscribers
- **Alternative Flow:** User browses upcoming events via map pins → RSVPs to one → receives 30-minute reminder notification before start time
- **Exceptional Flow:** Event is located within a user's blackout zone → event pin is hidden from that user's map view; their attendance and location are not visible to other attendees
