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

The central feature is interest-based proximity matching — users select interest categories and are notified when others with a common interest enter a predetermined geographic range. Strangers only see limited profile information about others while mutual friends with location sharing enabled can see precise locations. Location blackout zones allow users to permanently hide their presence in private areas such as their home. Chat functionality is gated behind shared interests and proximity, and structured user bios with predefined tags simplify moderation and reduce abuse.

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
- Mutual friends with precise location sharing enabled can see each other's exact location for a user-specified time window (X friends / circles for Y hours)

### Interest Subscriptions
- Users may subscribe to multiple interests or hashtags
- Per-interest notification settings: mute, digest, or live
- Users may only see interests they share in common with others (e.g., a user subscribed to #bikers cannot see another user's #LGBT tag unless both are subscribed to it)
- Interests may be marked public, private, or visible to specific friends only; default is friends only

### User Bios
- Structured bio fields: profile photo, highlighted interests (public visibility), experience level, and predefined tags/phrases (e.g., "LFG", "Open Availability", pronouns)
- No free-form text fields to reduce moderation complexity and abuse potential
- Automated first-pass moderation on profile photos to detect nudity, slurs, threats, and PII; human review panel for flagged content; appeals process for bans and suspensions

### User Blocking
- Blocking is per-person, not per-interest
- On block, both users are completely hidden from each other without notification to either party
- The blocking user receives a proximity warning overlay when within a defined radius of a blocked user (e.g., "You are within 100 ft of someone you've blocked")
- Mutual friends (C/D) may still interact with both A and B independently without either blocked party being made aware
- First-In policy for group chats: if User A is already in a group chat and User B (who A has blocked) is invited, B's join attempt is silently prevented with a generic error ("Failed to add user to group chat")

### Location Sharing & Blackout Zones
- Session-based location sharing: location is broadcast on app open and auto-expires after 1 hour
- Blackout zones prevent discovery at all times within a user-defined radius
- The app automatically prompts users to add a blackout zone if they are consistently detected at the same location overnight
- Users may add additional blackout zones by dropping pins on a map with a specified radius; GPS coordinates are stored, not street addresses

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
- However, predetermined ranges carry implicit assumptions about how interests are practiced geographically, which may reflect the biases of whoever sets them

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
- The proximity warning overlay gives the blocking user actionable situational awareness in physical spaces without revealing the block to the blocked party
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
- Automatic overnight location detection, used to suggest blackout zones, itself requires continuous background location access, which may feel invasive
- Users who travel or have irregular schedules (e.g., shift workers) may receive frequent and irrelevant blackout zone prompts
- A 1-hour session expiry may be too short for users engaging in long outdoor activities who want to remain discoverable

**Ethical Concerns:**
- The app must balance the utility of persistent location awareness against the fundamental right to not be tracked; the 1-hour expiry and blackout zones are key mitigations but must be prominently communicated to users
- Storing location data on servers, even as GPS coordinates, creates a data breach risk that could expose user movement patterns

---

### 6. Geofenced Chats (Original Feature)
**Pros:**
- Encourages genuine in-person connection by tying chat availability to physical proximity
- Reduces the app's use as a generic messaging platform, keeping interactions grounded in shared real-world context
- Provides a natural, low-friction way to end interactions that were purely transient (e.g., two strangers briefly in the same park)
- The opt-in to continue chat after leaving range gives users agency over which connections to maintain

**Cons:**
- Suspending chat mid-conversation due to range exit can feel abrupt and frustrating, particularly in edge cases like brief GPS drift
- Users may not realize their chat has been suspended, leading to unanswered messages and confusion
- Creates a barrier for users who connected in person and want to continue the conversation later from home

**Ethical Concerns:**
- Geofencing chat creates an implicit pressure to remain in a physical area to maintain a conversation, which could be exploited to coerce someone into staying somewhere they wish to leave
- Post-incident communication (e.g., after a safety event) may be blocked if users have left the range and not opted in to continue

---

### 7. First-In Group Chat Policy (Original Feature)
**Pros:**
- Prevents blocked users from being introduced into shared group social spaces, protecting the blocking user's sense of safety in group settings
- The generic error message prevents the blocked user from knowing they were specifically excluded by a block rather than a technical issue
- Requires no action from the blocking user — protection is automatic

**Cons:**
- The policy can be gamed by a bad actor who blocks someone first to preemptively exclude them from group chats
- Mutual friends creating a group chat may not understand why a user cannot be added, causing social friction with no explanation available to them
- Does not handle the case where the blocked user is added to a group first — the blocking user would then be the one excluded if they attempt to join later

**Ethical Concerns:**
- The silent exclusion, while protective, operates without transparency to any party other than the system, which raises questions about fairness in shared social spaces
- Group chat dynamics in real-world friend networks are complex; a binary block-based exclusion policy may not map cleanly onto nuanced social relationships

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

### Events / Activity Marker
- **Basic Flow:** User creates or joins an event → sees others attending with shared interest → arranges meetup
- **Alternative Flow:** User browses upcoming events → marks interest without immediately joining
- **Exceptional Flow:** Event is located within a user's blackout zone → user's attendance and location are not visible to other attendees
