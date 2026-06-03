// SquadSeeker — HW4 Test Suite
// Last updated: 2026-06-02
//
// HOW TO RUN (no install needed — zero external dependencies):
//   node tests.js
//
// WHAT THIS TESTS:
//   Unit tests    — individual functions in isolation (register, login, etc.)
//   Integration   — multiple functions working together (register→login→friendReq, etc.)
//
// WHAT IS NOT TESTED HERE:
//   DOM/UI functions require a browser. This file only tests the logic layer (app.js).

const {
  STATE, register, login, logout,
  sendFriendReq, acceptFriendReq,
  createEvent, rsvpEvent,
  filterEventsByInterest, getNearbyUsers,
  validateUsername, validatePassword,
} = require('./app.js');

// ── tiny test harness ───────────────────────────────────────────
let passed = 0, failed = 0;
const results = [];

function resetState() {
  Object.keys(STATE.users).forEach(k => delete STATE.users[k]);
  STATE.events.length = 0;
  Object.keys(STATE.friendRequests).forEach(k => delete STATE.friendRequests[k]);
  STATE.currentUser = null;
  delete STATE.newEvInt;
}

function test(category, name, fn) {
  resetState();
  try {
    fn();
    const label = category === 'UNIT' ? '  [unit]' : '[integ]';
    console.log(`  ✅ PASS ${label}  ${name}`);
    passed++;
    results.push({ category, name, status: 'PASS' });
  } catch (e) {
    const label = category === 'UNIT' ? '  [unit]' : '[integ]';
    console.log(`  ❌ FAIL ${label}  ${name}`);
    console.log(`              ${e.message}`);
    failed++;
    results.push({ category, name, status: 'FAIL', error: e.message });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}
function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ================================================================
// UNIT TESTS — single function in isolation
// ================================================================
console.log('\n══════════════════════════════════════════════════');
console.log('  UNIT TESTS');
console.log('══════════════════════════════════════════════════');

// --- Registration (unit) ---
console.log('\n── Registration ──');
test('UNIT', 'valid registration returns ok:true', () => {
  const r = register('alice', 'pass123', ['hiking']);
  assert(r.ok, 'register should return ok:true');
});
test('UNIT', 'registered user is stored in STATE', () => {
  register('alice', 'pass123', ['hiking']);
  assert(STATE.users['alice'], 'user should exist in STATE');
});
test('UNIT', 'duplicate username returns username_taken', () => {
  register('alice', 'pass123');
  const r = register('alice', 'other123');
  assert(!r.ok); assertEqual(r.error, 'username_taken');
});
test('UNIT', 'username shorter than 3 chars rejected', () => {
  const r = register('ab', 'pass123');
  assert(!r.ok); assertEqual(r.error, 'invalid_username');
});
test('UNIT', 'username longer than 30 chars rejected', () => {
  const r = register('a'.repeat(31), 'pass123');
  assert(!r.ok, '31-char username should be rejected by register()');
});
test('UNIT', 'username with spaces/special chars rejected', () => {
  const r = register('ali ce!', 'pass123');
  assert(!r.ok); assertEqual(r.error, 'invalid_username_chars');
});
test('UNIT', 'password under 6 chars rejected', () => {
  const r = register('alice', '123');
  assert(!r.ok); assertEqual(r.error, 'invalid_password');
});
test('UNIT', 'interests are stored on the user object', () => {
  register('alice', 'pass123', ['hiking', 'chess']);
  assertEqual(STATE.users['alice'].interests.length, 2);
});
test('UNIT', 'new user starts with empty friends list', () => {
  register('alice', 'pass123');
  assertEqual(STATE.users['alice'].friends.length, 0);
});

// --- Login / Logout (unit) ---
console.log('\n── Login / Logout ──');
test('UNIT', 'valid login sets STATE.currentUser', () => {
  register('alice', 'pass123');
  const r = login('alice', 'pass123');
  assert(r.ok); assertEqual(STATE.currentUser, 'alice');
});
test('UNIT', 'wrong password returns wrong_password', () => {
  register('alice', 'pass123');
  const r = login('alice', 'wrongpass');
  assert(!r.ok); assertEqual(r.error, 'wrong_password');
});
test('UNIT', 'login unknown user returns not_found', () => {
  const r = login('nobody', 'pass123');
  assert(!r.ok); assertEqual(r.error, 'not_found');
});
test('UNIT', 'logout sets STATE.currentUser to null', () => {
  register('alice', 'pass123');
  login('alice', 'pass123');
  logout();
  assertEqual(STATE.currentUser, null);
});

// --- Validation helpers (unit) ---
console.log('\n── Validation helpers ──');
test('UNIT', 'validateUsername rejects empty string', () => {
  assert(!validateUsername(''));
});
test('UNIT', 'validateUsername rejects 2-char string', () => {
  assert(!validateUsername('ab'));
});
test('UNIT', 'validateUsername accepts alphanumeric+underscore', () => {
  assert(validateUsername('alice_123'));
});
test('UNIT', '[BUG #3] validateUsername helper does NOT enforce 30-char max', () => {
  // Bug: register() correctly rejects >30 chars, but the standalone
  // validateUsername() helper lacks the length check and returns true.
  const result = validateUsername('a'.repeat(31));
  assert(result === true, `BUG CONFIRMED: validateUsername returned ${result} for 31-char string (should be false)`);
});
test('UNIT', 'validatePassword rejects strings under 6 chars', () => {
  assert(!validatePassword('123'));
});
test('UNIT', 'validatePassword accepts 6+ char string', () => {
  assert(validatePassword('pass123'));
});

// --- createEvent (unit: directly on a logged-in user) ---
console.log('\n── createEvent (unit) ──');
test('UNIT', 'createEvent adds event to STATE.events', () => {
  register('alice', 'pass123'); login('alice', 'pass123');
  const r = createEvent('Hike Sunday', 'hiking', 'Griffith Park', '2026-06-10');
  assert(r.ok); assertEqual(STATE.events.length, 1);
});
test('UNIT', 'createEvent without login returns not_logged_in', () => {
  const r = createEvent('Hike', 'hiking', 'Park', '2026-06-10');
  assert(!r.ok); assertEqual(r.error, 'not_logged_in');
});
test('UNIT', 'createEvent with blank title returns empty_title', () => {
  register('alice', 'pass123'); login('alice', 'pass123');
  const r = createEvent('   ', 'hiking', 'Park', '2026-06-10');
  assert(!r.ok); assertEqual(r.error, 'empty_title');
});
test('UNIT', 'createEvent sets host to currentUser', () => {
  register('alice', 'pass123'); login('alice', 'pass123');
  createEvent('Hike', 'hiking', 'Park', '2026-06-10');
  assertEqual(STATE.events[0].host, 'alice');
});
test('UNIT', 'createEvent auto-adds host to attendees', () => {
  register('alice', 'pass123'); login('alice', 'pass123');
  createEvent('Hike', 'hiking', 'Park', '2026-06-10');
  assert(STATE.events[0].attendees.includes('alice'));
});

// --- filterEventsByInterest (unit) ---
console.log('\n── filterEventsByInterest (unit) ──');
test('UNIT', 'returns only events matching the interest', () => {
  register('alice', 'pass123'); login('alice', 'pass123');
  createEvent('Hike A', 'hiking', 'Park', '2026-06-10');
  createEvent('Chess Open', 'chess', 'Library', '2026-06-11');
  const r = filterEventsByInterest('hiking');
  assertEqual(r.length, 1); assertEqual(r[0].title, 'Hike A');
});
test('UNIT', 'returns empty array when no events match', () => {
  register('alice', 'pass123'); login('alice', 'pass123');
  createEvent('Chess Open', 'chess', 'Library', '2026-06-11');
  assertEqual(filterEventsByInterest('hiking').length, 0);
});

// --- getNearbyUsers (unit) ---
console.log('\n── getNearbyUsers (unit) ──');
test('UNIT', 'returns users sharing the given interest', () => {
  register('alice', 'pass123', ['hiking']);
  register('bob', 'pass456', ['hiking', 'chess']);
  register('carol', 'passabc', ['chess']);
  login('alice', 'pass123');
  const nearby = getNearbyUsers('hiking');
  assert(nearby.some(u => u.username === 'bob'));
  assert(!nearby.some(u => u.username === 'carol'));
});
test('UNIT', 'excludes the currently logged-in user', () => {
  register('alice', 'pass123', ['hiking']);
  login('alice', 'pass123');
  const nearby = getNearbyUsers('hiking');
  assert(!nearby.some(u => u.username === 'alice'));
});

// ================================================================
// INTEGRATION TESTS — multiple functions working together
// ================================================================
console.log('\n══════════════════════════════════════════════════');
console.log('  INTEGRATION TESTS');
console.log('══════════════════════════════════════════════════');

console.log('\n── Register → Login → Send friend request ──');
test('INTEGRATION', 'full friend-request flow: send then accept creates mutual friendship', () => {
  register('alice', 'pass123');
  register('bob', 'pass456');
  login('alice', 'pass123');
  const sent = sendFriendReq('bob');
  assert(sent.ok, 'sendFriendReq should succeed');
  assert(STATE.friendRequests['bob'].includes('alice'), 'bob inbox should have alice');
  login('bob', 'pass456');
  const accepted = acceptFriendReq('alice');
  assert(accepted.ok, 'acceptFriendReq should succeed');
  assert(STATE.users['bob'].friends.includes('alice'), 'bob should have alice as friend');
  assert(STATE.users['alice'].friends.includes('bob'), 'alice should have bob as friend');
});

test('INTEGRATION', 'accepting a friend request removes it from inbox', () => {
  register('alice', 'pass123');
  register('bob', 'pass456');
  login('alice', 'pass123');
  sendFriendReq('bob');
  login('bob', 'pass456');
  acceptFriendReq('alice');
  const remaining = (STATE.friendRequests['bob'] || []).includes('alice');
  assert(!remaining, 'request should be gone from inbox after accept');
});

test('INTEGRATION', 'sendFriendReq without prior login fails (not_logged_in)', () => {
  register('bob', 'pass456');
  const r = sendFriendReq('bob');
  assert(!r.ok); assertEqual(r.error, 'not_logged_in');
});

test('INTEGRATION', '[BUG #1] sending friend request twice creates duplicate inbox entry', () => {
  register('alice', 'pass123');
  register('bob', 'pass456');
  login('alice', 'pass123');
  sendFriendReq('bob');
  sendFriendReq('bob'); // second call — no duplicate guard
  const count = STATE.friendRequests['bob'].filter(r => r === 'alice').length;
  assert(count === 2, `BUG CONFIRMED: inbox has ${count} entries (expected 1)`);
});

console.log('\n── Register → Login → Create event → RSVP ──');
test('INTEGRATION', 'full event flow: create then RSVP adds second user to attendees', () => {
  register('alice', 'pass123');
  register('bob', 'pass456');
  login('alice', 'pass123');
  const { event } = createEvent('Hike Sunday', 'hiking', 'Griffith Park', '2026-06-10');
  assert(STATE.events.length === 1, 'event should exist');
  login('bob', 'pass456');
  const r = rsvpEvent(event.id);
  assert(r.ok, 'rsvp should succeed');
  assert(STATE.events[0].attendees.includes('bob'), 'bob should be in attendees');
  assert(STATE.events[0].attendees.includes('alice'), 'alice (host) still in attendees');
});

test('INTEGRATION', 'rsvpEvent without login returns not_logged_in', () => {
  register('alice', 'pass123');
  login('alice', 'pass123');
  const { event } = createEvent('Hike', 'hiking', 'Park', '2026-06-10');
  logout();
  const r = rsvpEvent(event.id);
  assert(!r.ok); assertEqual(r.error, 'not_logged_in');
});

test('INTEGRATION', 'rsvpEvent with bad event ID returns event_not_found', () => {
  register('alice', 'pass123');
  login('alice', 'pass123');
  const r = rsvpEvent(99999);
  assert(!r.ok); assertEqual(r.error, 'event_not_found');
});

test('INTEGRATION', '[BUG #2] rsvpEvent not idempotent — double-RSVP inflates attendee count', () => {
  register('alice', 'pass123');
  register('bob', 'pass456');
  login('alice', 'pass123');
  const { event } = createEvent('Hike', 'hiking', 'Park', '2026-06-10');
  login('bob', 'pass456');
  rsvpEvent(event.id);
  rsvpEvent(event.id); // second call
  const count = STATE.events[0].attendees.filter(a => a === 'bob').length;
  assert(count === 2, `BUG CONFIRMED: bob appears ${count} times in attendees (expected 1)`);
});

console.log('\n── Register → Interest matching ──');
test('INTEGRATION', 'registered users with shared interests appear in getNearbyUsers', () => {
  register('alice', 'pass123', ['hiking']);
  register('bob', 'pass456', ['hiking', 'chess']);
  register('carol', 'passabc', ['chess']);
  login('alice', 'pass123');
  const nearby = getNearbyUsers('hiking');
  assert(nearby.length === 1 && nearby[0].username === 'bob',
    `Expected only bob, got: ${nearby.map(u=>u.username).join(', ')}`);
});

test('INTEGRATION', 'events created by one user are visible via filter to another', () => {
  register('alice', 'pass123', ['hiking']);
  register('bob', 'pass456', ['hiking']);
  login('alice', 'pass123');
  createEvent('Morning Hike', 'hiking', 'Runyon Canyon', '2026-06-10');
  login('bob', 'pass456');
  // bob can filter events by his own interest
  const evts = filterEventsByInterest('hiking');
  assertEqual(evts.length, 1);
  assertEqual(evts[0].host, 'alice');
});

// ================================================================
// SUMMARY
// ================================================================
const unitTotal    = results.filter(r => r.category === 'UNIT').length;
const unitPass     = results.filter(r => r.category === 'UNIT' && r.status === 'PASS').length;
const integTotal   = results.filter(r => r.category === 'INTEGRATION').length;
const integPass    = results.filter(r => r.category === 'INTEGRATION' && r.status === 'PASS').length;

console.log('\n══════════════════════════════════════════════════');
console.log('  RESULTS');
console.log('══════════════════════════════════════════════════');
console.log(`  Unit tests:        ${unitPass}/${unitTotal} passed`);
console.log(`  Integration tests: ${integPass}/${integTotal} passed`);
console.log(`  Total:             ${passed}/${passed+failed} passed`);
console.log('══════════════════════════════════════════════════');

const unexpectedFailures = results.filter(r =>
  r.status === 'FAIL' && !r.name.includes('[BUG')
);
if (unexpectedFailures.length > 0) {
  console.log('\n⚠️  UNEXPECTED failures (not known bugs):');
  unexpectedFailures.forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  process.exit(1);
} else {
  console.log('\n✅ All non-bug tests passed. Bug tests confirm known defects above.');
  process.exit(0);
}
