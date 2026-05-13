

# Squad Seeker — Architecture 

## Team Members:

- Anna Lee - chaeeul3
- Manas Kottakota - kottakom
- Nikash Malhotra - nikashm
- Tanmay Garg - tanmayg1
- Jared Yrastorza - jryrasto

---

# **1\. Architectural Summary**

Squad Seeker uses a client-server architecture with two backend services co-located on the same host. Clients reach each service directly: most user actions are sent to the API Server, while GPS updates are sent to the Location Service.

The system follows two design styles: client-server as the primary pattern, and event-driven for the proximity-alert and notification paths. The architecture targets an MVP buildable by a five-person team in one quarter; production concerns such as cloud deployment, full microservices decomposition, and content-moderation pipelines are noted where relevant but deferred until needed.

## **1.1 Components**

The system has four major components plus three external dependencies the application interacts with but does not own:

1\.      **iOS Client (mobile device).** A native SwiftUI application that handles user interaction, GPS polling via CoreLocation, map rendering, chat UI, and receipt of push notifications. The client holds no persistent business logic of its own, but sends user actions and location updates to the backend and renders whatever the backend returns. Our team chose Native SwiftUI over a cross-platform framework because the app is iOS-only by requirement, and CoreLocation's background-location and permission flows are most reliably accessed through native APIs.

2\.      **API Server (backend).** A single backend service that handles authentication, user profiles and bios, interest subscriptions, friendships, block management, chat message routing, and all client-facing REST and WebSocket endpoints. Internally the API Server is organized into modules (auth, users, interests, chat, moderation) but is deployed as a single process. A modular monolith gives us clear separation of concerns in code without the burden of running and coordinating many microservices.

3\.      **Location Service (backend).** A separate backend service responsible only for ingesting GPS updates, maintaining the geospatial index of active users, computing proximity matches against interest subscriptions, and enforcing blackout-zone filtering. We split this off from the API Server because location updates are the highest-volume traffic in the system (frequent updates, on the order of seconds, per active user) and because isolating it lets us reason about its performance characteristics independently. If the Location Service slows down or restarts, the rest of the app (chat, profiles, friend requests) still works.

4\.      **Database (PostgreSQL).** Persistent storage for users, bios, interest subscriptions, friendships, blocks, blackout zones, chat history, and event records. Postgres was chosen because it is well-supported in our coursework (CS 122A), has the PostGIS extension for the geospatial queries needed for blackout zones, and provides ACID guarantees that matter for safety-critical data like blocks and friendships.

The application also depends on three external systems it does not control:

•       **Apple Push Notification Service (APNs)** for delivering proximity alerts, friend requests, and chat-message notifications to iOS devices. APNs is the only mechanism Apple provides for push to iOS, so this is a requirement rather than a choice.

•       **Apple Maps (via MapKit)** for rendering the map view and blackout-zone interactions on the client.

•       **CoreLocation (iOS framework)** for GPS data on the device.

## **1.2 Connectors**

Communication between components uses the following connectors:

**Client ↔ API Server: HTTPS REST.** Most client-server interactions (login, posting bios, subscribing to interests, sending friend requests, defining blackout zones) use standard HTTPS REST requests with JSON payloads. JSON Web Tokens (JWTs) carry authentication.

**Client ↔ API Server: WebSocket.** Real-time chat uses a persistent, bidirectional WebSocket connection so that either side can send messages at any time without a new request. The architecture supports falling back to short-interval HTTP polling for chat receipt if WebSocket integration proves problematic during implementation. This would degrade real-time UX but preserve the app's functionality.

**Client → Location Service: HTTPS POST (batched).** GPS updates are sent on a tunable interval (initially planned at approximately every 15 seconds while foregrounded, longer in background) via simple HTTPS POST requests. We deliberately do not multiplex location updates over the chat WebSocket; keeping them on a separate, stateless path means location broadcasting works whether or not a chat session is open.

**API Server ↔ Location Service: internal HTTPS.** The two backend services exchange information over internal HTTPS calls. For example, the API Server queries the Location Service when it needs the current set of nearby users for a given interest in order to render the map view.

**Internal event bus (in-process pub-sub).** Within the API Server, the proximity-alert and notification flow is decoupled using an in-process event bus. When the Location Service detects a proximity match, it notifies the API Server, which publishes a proximity\_match event. A notification handler subscribed to that event constructs and dispatches the APNs push. This makes the architecture event-driven, since the code that detects a match does not directly call the code that sends a notification, so the two can evolve and fail independently. We chose an in-process event bus rather than a separate message broker (such as Redis Pub/Sub or RabbitMQ) because it requires no additional infrastructure and is sufficient for our technical scope.

**Backend ↔ Database: SQL over TCP.** Both backend services connect to Postgres using a standard SQL driver. The Location Service primarily uses PostGIS spatial queries for blackout-zone checks; the API Server uses ordinary relational queries for the rest of the data model.

**API Server → APNs: HTTPS.** Push notifications are dispatched from the API Server to Apple's APNs servers over HTTPS using device tokens registered by the client at login.

## **1.3 Design Styles**

**Client-Server** is the primary style. The iOS client is for presentation and user input, while the backend owns all business logic and persistent state. This separation matters for our app because:

•       Safety rules such as blocks, blackout zones, and range caps must be enforced server-side, since a modified client could otherwise bypass them.

•       It lets multiple clients (eventually Android) share one source of truth.

**Event-Driven** describes the proximity-alert path. Detecting a proximity match and delivering a push notification are decoupled through the in-process event bus, so the latency-sensitive matching logic does not block on the I/O-heavy notification dispatch. This style also makes it easy to add new reactions to the same event later (for example, logging matches for analytics, or triggering an in-app banner) without modifying the matching code.

## **1.4 Components and Where They Run**

| Component | Runs On |
| :---- | :---- |
| iOS Client | User's iPhone, iOS 16+ |
| API Server | UCI ICS-provided hosting (Linux server) |
| Location Service | UCI ICS-provided hosting (Linux server, same host) |
| Database (PostgreSQL) | UCI ICS-provided hosting (Linux server, same host) |
| APNs | Apple's servers (external) |
| Apple Maps / CoreLocation | User's iPhone (external iOS frameworks) |

 

Both backend services and the database are co-located on infrastructure provided by UCI's School of ICS for the duration of the class. In a production deployment, these would migrate to a cloud provider (AWS, GCP, or a PaaS such as Render or Railway) to gain managed backups, automatic scaling, and multi-region availability. However, those concerns are outside the scope of the app's MVP.

# **2\. Platforms**

Squad Seeker runs on three distinct platforms: the iOS client on user devices, the backend services on a Linux server, and PostgreSQL as the data store.

## **2.1 iOS Client: iPhone running iOS 16+, built with SwiftUI**

### **Benefits**

•       SwiftUI is Apple's current recommended framework for new iOS apps and gives us direct access to the iOS APIs the app depends on most: CoreLocation for GPS and background-location handling, MapKit for the map view, and the system permission flows for "Always Allow" location access.

•       Building natively means our app behaves like other iOS apps with built-in support for familiar gestures, navigation, system fonts, and dark mode, which lowers the design burden on our team.

•       Distribution through the App Store provides a baseline for testing before our app reaches real users.

### **Trade-offs**

•       Only a few members of our team (1–2) have prior Swift/SwiftUI experience, so there is a real ramp-up cost to development. We will mitigate this by pairing experienced and inexperienced members on client tasks, and by using AI coding assistants in accordance with course policy to support the learning curve.

•       iOS-only also means our user base is constrained to iPhone owners, which matters for an app whose value depends on local user density. Android is out of scope for this project and would be considered as future work after the MVP.

## **2.2 Backend: Linux server (university-provided hosting)**

### **Benefits**

•       Linux is the standard environment for hosting backend services and is what the university's hosting infrastructure runs. Most modern web frameworks, databases, and developer tools assume a Linux-like environment, so we will not run into compatibility surprises when deploying.

•       Using university hosting also means we do not need to set up cloud accounts, manage billing, or configure access control across team members, since the infrastructure is already there and provisioned for class use.

### **Trade-offs**

•       University hosting is fine for the scope of this class project but is not suitable for a real production deployment. It generally does not provide automatic scaling, managed backups, multi-region redundancy, or the level of uptime a public app would require. In a real launch we would migrate to a managed cloud provider (such as AWS, GCP, or a PaaS like Render). For this project, we accept the limitations of class hosting because the goal is a demonstrable MVP, not a production launch.

•       We are also constrained to whatever resources the ICS lab department can allocate. If we encounter resource constraints during testing, we may need to reduce simulated user counts rather than scale up the server.

## **2.3 Database: PostgreSQL on the same Linux host**

### **Benefits**

•       At least one team member has used PostgreSQL in a prior database course (CS 122A), so the team has working familiarity with SQL, schema design, and basic query optimization.

•       Postgres handles all the data shapes our app needs (user accounts, bios, friendships, blocks, interest subscriptions, blackout zones, chat history, and other relational data) using ordinary relational tables and joins.

•       It also has the PostGIS extension, which adds geospatial query support. We will use this for blackout-zone checks (testing whether a GPS coordinate falls inside a defined zone). Using one database for everything means we have one schema to maintain and one place to back up, rather than juggling multiple stores.

### **Trade-offs**

•       Running Postgres on the same Linux host as our backend services keeps things simple but means a server outage would take down both the application and the database.

•       In production we would put the database on its own managed instance (such as AWS RDS) so that the application servers and database can be scaled, backed up, and recovered independently. For the scope of this class, co-locating them removes an entire class of cross-machine networking issues we would otherwise have to debug.

## **2.4 Mitigations against Overscoped Architecture**

A common temptation in architecture documents is to prematurely design infrastructure that is inappropriate for the practical scope of the app (Redis caches, message brokers, Kubernetes clusters, separate microservices for each feature). For this project we deliberately chose the simpler option in each case:

•       **No separate cache layer (Redis, Memcached) at this stage.** Postgres alone is fast enough for our expected user counts during the class. If profiling later shows that a specific query is a bottleneck (most likely the proximity query in the Location Service), we would consider adding Redis at that point.

•       **No separate message broker (RabbitMQ, Kafka).** Our event-driven path uses an in-process event bus inside the API Server, which is sufficient when both the publisher and subscriber live in the same process.

•       **No containerization (e.g. Kubernetes) required.** We may use Docker locally for development convenience, but the deployed system runs as ordinary Linux processes.

# **3\. Programming Languages**

The system uses three languages, one per layer: Swift for the iOS client, Python for both backend services, and SQL for database queries. We chose to use a single language for both the API Server and the Location Service rather than mixing languages per service, because at our scale, the cost of maintaining two ecosystems outweighs any per-service performance benefit.

## **3.1 Swift (with SwiftUI) — iOS Client**

**Why Swift.** Swift is Apple's native language for iOS development and the only path that gives us first-class access to CoreLocation, MapKit, and the iOS permission system. SwiftUI, Swift's modern UI framework, lets us describe the UI declaratively, which keeps view code readable and easier to review across team members of differing experience levels.

**Trade-offs.** Swift is iOS-specific, so any code written for the client cannot be reused if we later want to support Android. A few of our team members have prior Swift experience, but others will be learning it alongside the project. We accept this learning cost because the alternative (a cross-platform framework like React Native) would force us to also learn a JavaScript bridge layer and would still require Swift for any low-level CoreLocation work.

## **3.2 Python (with FastAPI) — Backend Services**

**Why Python.** Python is the language our team has the most collective experience with, which is the single largest factor for a one-quarter project. We chose FastAPI as the web framework because it is async-first (suited to handling many concurrent location updates and WebSocket chat connections), has built-in support for Python type hints so we catch many bugs before they reach runtime (the same reason TypeScript is preferred over plain JavaScript), and automatically generates API documentation that the client team can read while building integrations. FastAPI is also lighter than Django, which matters because some team members have not used a web framework before, reducing the amount of learning to do before becoming productive.

**Trade-offs.** Python is slower than compiled languages like Go or Rust for raw computation. For our app, this matters most in the Location Service, which does proximity calculations on every GPS update. At our expected user counts during the class, Python is fast enough as proximity queries pushed down to PostgreSQL/PostGIS run in the database, not in Python. If we ever needed to scale to many thousands of concurrent users, we would profile first and consider rewriting only the hot path. Python also lacks compile-time type checking; we plan to evaluate static type-checking tools such as mypy as part of our development workflow to mitigate this.

## **3.3 SQL (PostgreSQL dialect) — Database Queries**

**Why SQL.** PostgreSQL is queried with standard SQL, with PostGIS-specific spatial functions for blackout-zone checks. At least one team member has prior SQL experience from a database course, and SQL is widely taught and well-documented, so the rest of the team can come up to speed using existing references.

**Trade-offs.** Writing raw SQL is verbose and error-prone for repetitive operations (inserting a user, updating a profile, etc.). To reduce this, we will likely use an ORM such as SQLAlchemy in the backend services, which lets us express common operations in Python while still dropping down to raw SQL for spatial queries that the ORM does not handle cleanly. Mixing ORM and raw SQL is a maintenance trade-off that the team needs to be disciplined about — which paths use which — but it is the most pragmatic choice for our needs.

## **3.4 Single Backend Language**

We considered using two different backend languages: Python for the API Server and Go for the Location Service to take advantage of Go's concurrency model. We rejected this for three reasons:

* **Team capacity.** Maintaining two backend ecosystems doubles the surface area of dependencies, build tools, and debugging knowledge needed across the team.  
* **No measured need.** The performance argument for Go applies at scales we will not reach during the class. Choosing it now would be premature optimization.  
* **Code sharing.** Using one language lets us share data models, validation logic, and utility code between the two services through a common Python package, rather than redefining types in two places.

If profiling later shows the Location Service is a performance bottleneck, isolating it as its own service (which we have already done) makes a future rewrite in another language tractable. We would only have to rewrite that one service, with the API contract between them unchanged.

# **4\. Communication Protocols**

Squad Seeker uses several distinct communication protocols, each chosen to fit the interaction pattern it carries. We deliberately use HTTPS throughout for both client-server traffic and for internal calls between backend services, so that no part of the system depends on an unencrypted channel.

## **4.1 Client ↔ API Server: HTTPS REST (JSON)**

Most client-server interaction is request-response: log in, fetch a profile, subscribe to an interest, send a friend request, define a blackout zone, fetch the list of nearby users for a given interest. These all fit cleanly into the REST protocol: each request is independent, each has a clear resource being acted on, and each completes with a single response.

| \# | Data Communicated | Example |
| :---- | :---- | :---- |
| 1 | User input | interest selections, profile data, friend-request targets, blackout zone coordinates |
| 2 | Result | success acknowledgments, lists of nearby users, profile data, error messages |

 

**Why REST fits.** REST is the simplest protocol that does the job. Interactions are stateless from the protocol's point of view (each request stands on its own), the operations map naturally onto HTTP verbs (GET for reads, POST for creates, PUT for updates, DELETE for removals), and SwiftUI's URLSession supports it natively. Choosing anything more complex (gRPC, GraphQL) would add learning cost without giving us a feature we actually need.

## **4.2 Client ↔ API Server: WebSocket (Chat)**

Real-time chat uses a persistent WebSocket connection. Once a chat session is open, either side can send messages at any time without a new request, and the connection stays alive as messages flow in both directions.

| \# | Data Communicated | Example |
| :---- | :---- | :---- |
| 1 | Chat messages | sender ID, recipient ID or session ID, message text, timestamp |
| 2 | Session lifecycle events | connection opened, connection closed, geofence range exit triggering chat suspension |
| 3 | Authentication on connection open | auth header carrying JWT |

 

**Why WebSocket fits.** REST is a poor fit for chat because the server needs to push messages to the client without the client asking, and HTTP is fundamentally request-response. The two alternatives we considered were short-interval HTTP polling (the client repeatedly asks "any new messages?" every few seconds) and push notifications only. Polling drains battery and creates unnecessary load that scales with the number of idle users; notifications-only would not match the live chat experience our requirements describe. WebSockets give us bidirectional, low-latency message flow with one persistent connection per active chat user.

**Risk mitigation.** WebSocket handling is more complex than REST (connection lifecycle, reconnection, authentication on open). If WebSocket integration becomes a blocker during implementation, we will fall back to short-interval HTTP polling for message receipt. This degrades the real-time user experience but keeps the feature functional, and is straightforward to swap in because the message-sending path is already HTTP-based (see 4.3).

## **4.3 Client → Location Service: HTTPS POST (GPS Updates)**

GPS updates are sent from the client to the Location Service as ordinary HTTPS POST requests.

| \# | Data Communicated | Example |
| :---- | :---- | :---- |
| 1 | GPS data | latitude, longitude, GPS accuracy estimate, timestamp |
| 2 | User identity | JWT in Authorization header |

 

**Why a separate path.** Keeping the location update channel independent of the chat session means location broadcasting works whether or not a chat is open. It also means a problem with chat (a dropped WebSocket, a misbehaving session) cannot stop location updates, and vice versa. This separation of concerns is the same reasoning that led us to make the Location Service its own backend component.

**Update frequency.** Updates will be sent on a tunable interval (initially planned at approximately every 15 seconds while the app is in the foreground, and longer while backgrounded), in accordance with iOS background-execution limits. We expect to adjust these intervals during testing to balance proximity-alert freshness against battery impact, and we will document the chosen values in our implementation report.

## **4.4 API Server ↔ Location Service: Internal HTTPS**

The two backend services exchange information over internal HTTPS calls. For example, the API Server queries the Location Service when it needs the current set of nearby users for a given interest in order to render the map view.

| \# | Data Communicated | Example |
| :---- | :---- | :---- |
| 1 | Service-to-service queries with structured JSON payloads | requests for nearby users by interest and location, requests to register or revoke a user's location subscription, proximity-match notifications flowing the other direction |

 

**Why HTTPS rather than something more specialized.** At our scale, plain HTTPS is sufficient and simple. We considered alternatives such as gRPC (faster, type-safe, but adds a code-generation step and a new framework to learn) and direct shared-database access (also faster, but couples the services together in a way that defeats the point of separating them). Internal HTTPS gives us a clear, debuggable interface between the two services using tools the team readily understands.

## **4.5 Authentication: JWT (JSON Web Tokens)**

All client-to-backend requests after login carry a JWT in the Authorization header. The token is issued by the API Server at login, signed with a server-side secret, and contains the user's ID and an expiration time. Both backend services verify the signature on each request without needing a shared session store.

**Why JWT.** JWT fits our architecture for three reasons:

* Native mobile clients work more naturally with token-based auth than with cookie-based sessions, which assume browser behavior.  
* JWT lets us authenticate WebSocket connections cleanly, as the client sends the token in the initial WebSocket message.  
* JWT is stateless: the server doesn't need to remember who is logged in, which is consistent with our decision not to add a session store like Redis at this stage.

**Trade-off.** JWTs cannot be revoked instantly. Once issued, a token is valid until it expires. We accept this trade-off by setting reasonable token expiry times (on the order of hours, not days) and requiring users to re-authenticate periodically. In production, apps that need instant revocation maintain a short list of revoked tokens that the server checks on each request; we consider this future work.

## **4.6 API Server → APNs: HTTPS**

Push notifications for proximity alerts, friend requests, and chat-message banners are dispatched from the API Server to Apple's Push Notification Service over HTTPS. Each iOS client registers a device token at login that the server stores; when a notification needs to be delivered, the server looks up the token and posts a JSON payload to APNs, which delivers it to the device.

This is the only way to send push notifications to iOS, as Apple does not allow third parties to push directly to devices.

## **4.7 Internal Event Bus (In-Process)**

Within the API Server, the proximity-alert flow uses an in-process event bus rather than a network protocol. When the Location Service notifies the API Server of a proximity match, the API Server publishes a proximity\_match event on its internal bus, and a notification handler subscribed to that event constructs and dispatches the APNs push.

The publisher and subscriber are functions in the same Python process, and the event bus is a simple in-memory dispatcher. We mention it in this section because it is part of the system's communication design even though it is not a network protocol. This choice avoids the operational overhead of running a separate message broker such as RabbitMQ or Redis pub/sub, while still preserving the decoupling benefit of event-driven design: the code that detects a match does not directly call the code that sends a notification.

## **4.8 Backend ↔ Database: SQL over TCP**

Both backend services connect to PostgreSQL using the standard PostgreSQL wire protocol over TCP. This is a built-in concern for any database-backed application; we mention it only for completeness. Connections are managed through a connection pool to avoid the overhead of opening a new TCP connection for every query.

# **5\. Component Functions and Connector Communications by Use Case**

This section traces each major use case through the components and connectors defined in Sections 1–4. For each use case, we describe the user-visible flow, then show the step-by-step path each request takes through the system. JWT authentication is implicit on every Client → Backend step; we omit it from the tables for readability.

## **5.1 Interest-Based Matching and Range-Based Discovery**

These two use cases substantially share the same flow. In both, a user subscribes to one or more interests, and when another user with overlapping interests enters the relevant range, both are notified and shown to each other on the map.

**Conceptual flow.** A user opens the app and selects interests they want to be matched on. The client begins sending GPS updates. The Location Service maintains a spatial index of active users by interest, and on each incoming update checks whether the user has just entered the range of any other user subscribed to the same interest. When a match is found, the API Server is notified, publishes an internal event, and a notification handler dispatches a push notification to both users.

| Step | Component | Function | Data Across Connector |
| :---- | :---- | :---- | :---- |
| 1 | iOS Client | selectInterests() | User taps interest tags; selection stored locally pending submission. |
| 2 | iOS Client → API Server | HTTPS POST /interests/subscribe | { userId, interestIds, visibility } |
| 3 | API Server | saveSubscriptions(); persists subscription rows in PostgreSQL; returns confirmation. |  \- |
| 4 | iOS Client → Location Service | HTTPS POST /location/update | { userId, lat, lng, accuracy, timestamp } |
| 5 | Location Service | checkBlackoutZones(); PostGIS query for the user's blackout zones; if inside one, the update is discarded. |  \- |
| 6 | Location Service | updateGeoIndex() then computeProximityMatches(); updates the user's position, then queries the spatial index for other users subscribed to the same interest within the per-interest range cap. |  \- |
| 7 | Location Service → API Server | Internal HTTPS POST /internal/proximity-match | { userIdA, userIdB, sharedInterest, approxDistance } |
| 8 | API Server | publishEvent("proximity\_match", ...)  in-process event bus dispatches to the notification handler. |  \- |
| 9 | API Server → APNs → iOS Client | HTTPS POST to APNs | APNs payload: { alert, interestId, matchUserId }. Both matched users receive notifications. |

## **5.2 Profile / Bio Interaction**

**Conceptual flow.** A user fills out their structured bio (profile photo, highlighted interests, experience level, predefined tags). The client uploads the photo and bio fields to the API Server. The Moderation module on the API Server checks the photo (using an external content-analysis service for the photo and a simple keyword filter for any free-text fields). If clean, the bio is saved and visible to other users; if flagged, the bio is held in a review queue and the user is notified.

| Step | Component | Function | Data Across Connector |
| :---- | :---- | :---- | :---- |
| 1 | iOS Client | composeBio(); user fills structured bio fields and selects photo from device. |  \- |
| 2 | iOS Client → API Server | HTTPS POST /profile/update (multipart) | photo binary \+ JSON bio fields |
| 3 | API Server | runPhotoModeration(); sends photo to external content-analysis service over HTTPS; receives a flag/clean response. |  \- |
| 4 | API Server | runTextFilter(); checks free-text fields against a simple keyword filter for slurs, threats, and PII patterns. |  \- |
| 5 | API Server | saveProfile() if clean, or enqueueForReview() if flagged; writes to PostgreSQL. |  \- |
| 6 | API Server → iOS Client | HTTPS response | { status: "saved" } or { status: "pending\_review", reason } |

 

A separate flow handles other users *viewing* a profile: the requesting client sends GET /profile/{userId}, the API Server checks visibility settings (public, friends-only, private) against the requester's relationship to the target user, and returns either the bio or a stub response.

## **5.3 Chat Between Users**

**Conceptual flow.** Two users who share at least one interest and are within range of each other can initiate a chat. The API Server validates the shared-interest and proximity preconditions, opens a chat session, and accepts a WebSocket connection from each user. Messages flow over the WebSocket and are checked by the moderation module before delivery. The Location Service continuously monitors whether either user has left the shared-interest range; if so, the chat is suspended unless both users opt to keep it active.

| Step | Component | Function | Data Across Connector |
| :---- | :---- | :---- | :---- |
| 1 | iOS Client → API Server | HTTPS POST /chat/initiate | { fromUserId, toUserId, interestId } |
| 2 | API Server | validateSharedInterestAndProximity(); checks PostgreSQL for shared interest; queries Location Service for current proximity. |  \- |
| 3 | API Server | createChatSession(); creates a session record in PostgreSQL; returns session ID to client. |  \- |
| 4 | iOS Client ↔ API Server | WebSocket upgrade | upgrade request includes JWT in Authorization header; server confirms session ID |
| 5 | iOS Client → API Server | WebSocket frame: send message | { sessionId, content, timestamp } |
| 6 | API Server | runMessageModeration(); synchronous keyword/pattern check; flagged messages are not delivered, and the sender receives a warning. |  \- |
| 7 | API Server | deliverMessage(); persists message in PostgreSQL; pushes to recipient's WebSocket. |  \- |
| 8 | Location Service → API Server | Internal HTTPS POST /internal/range-exit | { userId, sessionId } if either user leaves the shared-interest range |
| 9 | API Server → iOS Client | WebSocket frame: range suspension | { event: "chat\_suspended", reason: "out\_of\_range", optInUrl } |

 

If the WebSocket fallback (HTTP polling) is in use, steps 5–7 and step 9 are reshaped: the client polls a /chat/messages?since=... endpoint instead of receiving frames, and message sending uses HTTPS POST. The functional steps and data shapes remain the same.

## **5.4 Blocking & Safety**

**Conceptual flow.** A user blocks another user. The block is recorded in the database, both users immediately disappear from each other's discovery and chat, and any future group chat where both would be present is prevented. If the blocked user later moves into close proximity (under 100 ft), only the user who initiated the block receives a discreet warning.

| Step | Component | Function | Data Across Connector |
| :---- | :---- | :---- | :---- |
| 1 | iOS Client → API Server | HTTPS POST /users/block | { blockerId, blockedId } |
| 2 | API Server | createBlock(); inserts a row in the blocks table in PostgreSQL. No notification is sent to the blocked user. |  \- |
| 3 | API Server → Location Service | Internal HTTPS POST /internal/block | { blockerId, blockedId }; Location Service updates its in-memory block index for fast filtering |
| 4 | Location Service | filterBlockedFromMatches(); all future proximity-match queries exclude this pair from results. |  \- |
| 5 | Location Service | detectBlockedProximity(); if the two users come within 100 ft, emit a block-proximity event for the blocker only. |  \- |
| 6 | Location Service → API Server | Internal HTTPS POST /internal/blocked-proximity-alert | { blockerId, blockedId, distanceFt } |
| 7 | API Server → APNs → iOS Client (blocker only) | APNs payload | "Heads up: someone you've blocked is nearby." Blocked user receives nothing. |
| 8 | API Server | enforceBlockOnGroupInvite(); when a group chat invite would put a blocker and blocked user in the same chat, the invite fails with a generic "Failed to add user" error to avoid leaking the block. |  \- |

## **5.5 Location Sharing Controls**

**Conceptual flow.** When the app is opened, the client requests location permission and begins sending GPS updates to the Location Service. The Location Service automatically discards any update that falls inside a user-defined blackout zone. If the same overnight location is detected on multiple consecutive nights, the system suggests adding it as a blackout zone. The overnight-pattern detection runs as a periodic background task within the Location Service. The user can also manually define blackout zones by dropping a pin on the map.

| Step | Component | Function | Data Across Connector |
| :---- | :---- | :---- | :---- |
| 1 | iOS Client (CoreLocation) | startLocationUpdates(); begins GPS polling on app foreground; permission required. |  \- |
| 2 | iOS Client → Location Service | HTTPS POST /location/update (sent on a tunable interval) | { userId, lat, lng, accuracy, timestamp } |
| 3 | Location Service | checkBlackoutZones(); PostGIS spatial query: is the current point inside any of this user's blackout zones? |  \- |
| 4 | Location Service | updateGeoIndex() if outside any zone; updates the user's position in the spatial index. If inside a zone, the update is discarded and the user appears offline to others. |  \- |
| 5 | Location Service | detectOvernightPattern() (periodic background task); looks for repeated overnight clusters in the user's location history. |  \- |
| 6 | Location Service → API Server → APNs → iOS Client | Push notification | "You're often here at night. Add a blackout zone here?" with the suggested coordinates |
| 7 | iOS Client → API Server | HTTPS POST /blackout/add | { userId, lat, lng, radiusMeters } |
| 8 | API Server | saveBlackoutZone(); persists the zone in PostgreSQL. From this point on, checkBlackoutZones (step 3\) catches updates inside this zone. |  \- |

## **5.6 Friend Requests and Mutual-Friend Interactions**

This use case captures the interaction tiers defined in HW1 functional requirements g, h, and i, which distinguish strangers, mutual-interest users, and mutual friends.

**Conceptual flow.** A user can send a friend request only if they share at least one interest with the target and are within range, OR if they are using the cross-range request path described in HW1 (in which the request lands in a separate inbox for the recipient to review later). Once both users have accepted, they are mutual friends and can interact regardless of proximity.

| Step | Component | Function | Data Across Connector |
| :---- | :---- | :---- | :---- |
| 1 | iOS Client → API Server | HTTPS POST /friends/request | { fromUserId, toUserId, interestId } |
| 2 | API Server | validateFriendRequestEligibility(); checks PostgreSQL for shared interest; queries Location Service for proximity. Routes the request to the inbox path if the users are out-of-range but share the interest. |  \- |
| 3 | API Server | createFriendRequest(); inserts pending-friendship row in PostgreSQL. |  \- |
| 4 | API Server → APNs → iOS Client (recipient) | Push notification | "X wants to connect about \[interest\]." |
| 5 | iOS Client → API Server | HTTPS POST /friends/accept | { requestId } |
| 6 | API Server | acceptFriendship(); updates the row to "accepted"; both users are now mutual friends. |  \- |
| 7 | API Server → APNs → iOS Client (requester) | Push notification | "X accepted your request." |

 

