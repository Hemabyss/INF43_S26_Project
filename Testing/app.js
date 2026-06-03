// SquadSeeker — extracted logic layer (testable, no DOM dependencies)
// Source: squadseeker-app.html (artifact f8ace482-848d-4d8e-8cfb-41563eba3300)

const STATE = {
  currentUser: null,
  users: {},
  events: [],
  friendRequests: {},
  // Note: newEvInt is dynamically added in openCreateEvent — Bug #4
};

// ---------- Auth ----------
function register(username, password, interests) {
  if (!username || username.length < 3 || username.length > 30) return { ok: false, error: 'invalid_username' };
  if (!password || password.length < 6) return { ok: false, error: 'invalid_password' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { ok: false, error: 'invalid_username_chars' };
  if (STATE.users[username]) return { ok: false, error: 'username_taken' };
  STATE.users[username] = { username, password, interests: interests || [], friends: [], eventsJoined: [] };
  return { ok: true };
}

function login(username, password) {
  const u = STATE.users[username];
  if (!u) return { ok: false, error: 'not_found' };
  if (u.password !== password) return { ok: false, error: 'wrong_password' };
  STATE.currentUser = username;
  return { ok: true };
}

function logout() {
  STATE.currentUser = null;
  return { ok: true };
}

// ---------- Friends ----------
function sendFriendReq(toUsername) {
  if (!STATE.currentUser) return { ok: false, error: 'not_logged_in' };
  if (!STATE.users[toUsername]) return { ok: false, error: 'user_not_found' };
  if (toUsername === STATE.currentUser) return { ok: false, error: 'cannot_add_self' };
  if (!STATE.friendRequests[toUsername]) STATE.friendRequests[toUsername] = [];
  // BUG #1: no duplicate guard — calling twice pushes two entries
  STATE.friendRequests[toUsername].push(STATE.currentUser);
  return { ok: true };
}

function acceptFriendReq(fromUsername) {
  if (!STATE.currentUser) return { ok: false, error: 'not_logged_in' };
  const reqs = STATE.friendRequests[STATE.currentUser] || [];
  if (!reqs.includes(fromUsername)) return { ok: false, error: 'no_request' };
  STATE.users[STATE.currentUser].friends.push(fromUsername);
  STATE.users[fromUsername].friends.push(STATE.currentUser);
  STATE.friendRequests[STATE.currentUser] = reqs.filter(r => r !== fromUsername);
  return { ok: true };
}

// ---------- Events ----------
function createEvent(title, interest, location, date) {
  if (!STATE.currentUser) return { ok: false, error: 'not_logged_in' };
  if (!title || title.trim().length === 0) return { ok: false, error: 'empty_title' };
  const evt = {
    id: Date.now() + Math.random(),
    title: title.trim(),
    interest: interest || STATE.newEvInt, // Bug #4: STATE.newEvInt may be undefined
    location,
    date,
    host: STATE.currentUser,
    attendees: [STATE.currentUser],
  };
  STATE.events.push(evt);
  return { ok: true, event: evt };
}

function rsvpEvent(eventId) {
  if (!STATE.currentUser) return { ok: false, error: 'not_logged_in' };
  const evt = STATE.events.find(e => e.id === eventId);
  if (!evt) return { ok: false, error: 'event_not_found' };
  // BUG #2: no idempotency — calling twice adds user twice, inflating count
  evt.attendees.push(STATE.currentUser);
  STATE.users[STATE.currentUser].eventsJoined.push(eventId);
  return { ok: true };
}

function filterEventsByInterest(interest) {
  return STATE.events.filter(e => e.interest === interest);
}

function getNearbyUsers(interest) {
  return Object.values(STATE.users).filter(
    u => u.username !== STATE.currentUser && u.interests.includes(interest)
  );
}

// ---------- Validation helpers (exposed for testing) ----------
function validateUsername(u) {
  // BUG #3: regex does NOT enforce max 30 chars (UI shows counter but logic misses it)
  return typeof u === 'string' && u.length >= 3 && /^[a-zA-Z0-9_]+$/.test(u);
}

function validatePassword(p) {
  return typeof p === 'string' && p.length >= 6;
}

// Export for Node.js testing
if (typeof module !== 'undefined') {
  module.exports = {
    STATE, register, login, logout,
    sendFriendReq, acceptFriendReq,
    createEvent, rsvpEvent,
    filterEventsByInterest, getNearbyUsers,
    validateUsername, validatePassword,
  };
}
