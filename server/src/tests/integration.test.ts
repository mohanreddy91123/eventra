import { strict as assert } from 'assert';
import pool from '../config/database.js';

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint: string, options: any = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  let data: any = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  return { status, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING EVENTRA EXACT PERMISSION WORKFLOW TESTS');
  console.log('====================================================\n');

  let studentToken = '';
  let teacherToken = '';
  let sacToken = '';

  // 0. Setup Logins
  console.log('Step 0: Logging in as Student, Teacher, and Edu Cell/SAC...');

  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'aarav.sharma@campus.edu', password: 'Password@123' },
  });
  assert.equal(studentLogin.status, 200, 'Student login failed');
  studentToken = studentLogin.data.token;
  console.log('  ✅ Student logged in successfully');

  const teacherLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'prof.ravi.kumar@campus.edu', password: 'Password@123' },
  });
  assert.equal(teacherLogin.status, 200, 'Teacher login failed');
  teacherToken = teacherLogin.data.token;
  console.log('  ✅ Teacher logged in successfully');

  const sacLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'sac.coordinator@campus.edu', password: 'Password@123' },
  });
  assert.equal(sacLogin.status, 200, 'SAC login failed');
  sacToken = sacLogin.data.token;
  console.log('  ✅ SAC Coordinator logged in successfully\n');

  // ----------------------------------------------------
  // TEST 1 — STUDENT: View published event -> Apply/Register -> SUCCESS
  // ----------------------------------------------------
  console.log('TEST 1 — STUDENT APPLICATION:');
  console.log('  Testing student browsing published events and applying directly...');

  const eventsRes = await request('/events', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(eventsRes.status, 200, 'Failed to fetch events');
  assert.ok(eventsRes.data.events.length > 0, 'No events found');

  const publishedEvent = eventsRes.data.events[0];
  console.log(`  Found published event: "${publishedEvent.title}" (Status: ${publishedEvent.status})`);

  // Find or create an event student hasn't applied to yet
  let eventToApply = eventsRes.data.events.find((e: any) => !e.has_applied);
  if (!eventToApply) {
    eventToApply = publishedEvent;
  }

  const applyRes = await request(`/events/${eventToApply.id}/apply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: { notes: 'Interested in participating' },
  });

  // Either 201 Created or 409 Conflict if already applied in previous run
  assert.ok(
    applyRes.status === 201 || applyRes.status === 409,
    `Unexpected apply status: ${applyRes.status}`
  );
  console.log(`  ✅ TEST 1 PASSED: Student directly applied for published event (Response: ${applyRes.status} ${applyRes.data.message})\n`);

  // ----------------------------------------------------
  // TEST 2 — TEACHER: Create Event -> PUBLISHED immediately
  // ----------------------------------------------------
  console.log('TEST 2 — TEACHER EVENT CREATION:');
  console.log('  Testing Teacher direct event creation (No approval required)...');

  const teacherEventData = {
    title: `Faculty Robotics Workshop ${Date.now()}`,
    description: 'Hands-on hardware & robotics session organized directly by faculty.',
    category: 'Workshop',
    event_date: '2026-10-15',
    start_time: '10:00',
    end_time: '16:00',
    location: 'Robotics Lab 3',
    organizer_name: 'Prof. Ravi Kumar',
    organizer_phone: '9845012345',
    registration_start: '2026-09-01 00:00:00',
    registration_deadline: '2026-10-14 23:59:59',
    capacity: 60,
    eligibility: 'All Engineering Students',
    target_department: 'Computer Science, Electronics',
    required_skills: ['C++', 'Microcontrollers'],
    relevant_interests: ['Robotics', 'Hardware'],
  };

  const teacherCreateRes = await request('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: teacherEventData,
  });

  assert.equal(teacherCreateRes.status, 201, `Teacher event creation failed: ${JSON.stringify(teacherCreateRes.data)}`);
  const teacherEventId = teacherCreateRes.data.eventId;

  // Verify status is PUBLISHED immediately
  const getCreatedEvent = await request(`/events/${teacherEventId}`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(getCreatedEvent.status, 200);
  assert.equal(getCreatedEvent.data.event.status, 'PUBLISHED', 'Teacher event status is not PUBLISHED');
  console.log(`  ✅ TEST 2 PASSED: Teacher created event #${teacherEventId}. Status is immediately "${getCreatedEvent.data.event.status}".\n`);

  // ----------------------------------------------------
  // TEST 3 — SAC: Create Event Request -> PENDING_TEACHER_APPROVAL
  // ----------------------------------------------------
  console.log('TEST 3 — SAC EVENT REQUEST:');
  console.log('  Testing SAC submitting event permission request...');

  const sacRequestData = {
    event_title: `Annual Cultural Fest 2026 ${Date.now()}`,
    event_description: 'Grand campus cultural extravaganza hosted by Student Activity Center.',
    category: 'Cultural',
    event_date: '2026-11-20',
    start_time: '17:00',
    end_time: '22:00',
    location: 'Main University Amphitheatre',
    organizer_name: 'SAC Coordinator',
    organizer_phone: '9845099999',
    registration_start: '2026-10-01 00:00:00',
    registration_deadline: '2026-11-19 23:59:59',
    capacity: 500,
    eligibility: 'Open to All Students & Faculty',
    target_department: 'All Departments',
    required_skills: ['Music', 'Drama', 'Dance'],
    relevant_interests: ['Cultural', 'Arts'],
  };

  const sacRequestRes = await request('/permission-requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sacToken}` },
    body: sacRequestData,
  });

  assert.equal(sacRequestRes.status, 201, `SAC request creation failed: ${JSON.stringify(sacRequestRes.data)}`);
  const sacRequestId = sacRequestRes.data.requestId;

  // Verify request status is PENDING_TEACHER_APPROVAL
  const getSacReq = await request(`/permission-requests/${sacRequestId}`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  assert.equal(getSacReq.status, 200);
  assert.equal(getSacReq.data.request.status, 'PENDING_TEACHER_APPROVAL', 'SAC request status is not PENDING_TEACHER_APPROVAL');
  console.log(`  ✅ TEST 3 PASSED: SAC created request #${sacRequestId}. Status is "${getSacReq.data.request.status}" (Event is NOT published yet).\n`);

  // ----------------------------------------------------
  // TEST 4 — TEACHER APPROVES SAC REQUEST: Request = APPROVED
  // ----------------------------------------------------
  console.log('TEST 4 — TEACHER APPROVES SAC REQUEST:');
  console.log(`  Teacher reviewing and approving SAC request #${sacRequestId}...`);

  const teacherApproveRes = await request(`/permission-requests/${sacRequestId}/review`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: { status: 'APPROVED' },
  });

  assert.equal(teacherApproveRes.status, 200, `Teacher approval failed: ${JSON.stringify(teacherApproveRes.data)}`);

  // Verify status is APPROVED
  const getApprovedReq = await request(`/permission-requests/${sacRequestId}`, {
    headers: { Authorization: `Bearer ${sacToken}` },
  });
  assert.equal(getApprovedReq.data.request.status, 'APPROVED', 'Request status is not APPROVED');
  console.log(`  ✅ TEST 4 PASSED: Teacher approved SAC request #${sacRequestId}. Status is "${getApprovedReq.data.request.status}".\n`);

  // ----------------------------------------------------
  // TEST 5 — SAC AFTER APPROVAL: SAC Publishes Event -> PUBLISHED
  // ----------------------------------------------------
  console.log('TEST 5 — SAC PUBLISHES APPROVED EVENT:');
  console.log(`  SAC publishing approved event request #${sacRequestId}...`);

  const sacPublishRes = await request(`/permission-requests/${sacRequestId}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sacToken}` },
  });

  assert.equal(sacPublishRes.status, 201, `SAC publish failed: ${JSON.stringify(sacPublishRes.data)}`);
  const publishedEventId = sacPublishRes.data.eventId;

  // Verify student can now see this published event
  const getPubEvent = await request(`/events/${publishedEventId}`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.equal(getPubEvent.status, 200, 'Student cannot find published event');
  assert.equal(getPubEvent.data.event.status, 'PUBLISHED', 'Event is not PUBLISHED');
  console.log(`  ✅ TEST 5 PASSED: Event #${publishedEventId} is now "${getPubEvent.data.event.status}". Students can discover and register.\n`);

  // ----------------------------------------------------
  // TEST 6 — TEACHER REJECTS SAC REQUEST: Request = REJECTED
  // ----------------------------------------------------
  console.log('TEST 6 — TEACHER REJECTS SAC REQUEST:');
  console.log('  Creating second SAC request and testing Teacher rejection...');

  const sacRequest2Res = await request('/permission-requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sacToken}` },
    body: {
      ...sacRequestData,
      event_title: `Conflicting Fest ${Date.now()}`,
    },
  });
  assert.equal(sacRequest2Res.status, 201);
  const sacRequestId2 = sacRequest2Res.data.requestId;

  const teacherRejectRes = await request(`/permission-requests/${sacRequestId2}/review`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: {
      status: 'REJECTED',
      rejection_reason: 'Schedule conflicts with departmental semester examinations.',
    },
  });
  assert.equal(teacherRejectRes.status, 200);

  const getRejectedReq = await request(`/permission-requests/${sacRequestId2}`, {
    headers: { Authorization: `Bearer ${sacToken}` },
  });
  assert.equal(getRejectedReq.data.request.status, 'REJECTED', 'Request is not REJECTED');
  assert.ok(getRejectedReq.data.request.rejection_reason?.includes('examinations'), 'Rejection reason missing');
  console.log(`  ✅ TEST 6 PASSED: Teacher rejected request #${sacRequestId2} (Reason: "${getRejectedReq.data.request.rejection_reason}"). Event is NOT published.\n`);

  // ----------------------------------------------------
  // TEST 7 — SAC DIRECT EVENT CREATION SECURITY: 403 Forbidden
  // ----------------------------------------------------
  console.log('TEST 7 — SAC DIRECT CREATION SECURITY:');
  console.log('  Testing that SAC cannot bypass permission workflow by calling POST /events directly...');

  const sacBypassRes = await request('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sacToken}` },
    body: {
      ...teacherEventData,
      title: 'Unauthorized SAC Direct Event',
    },
  });

  assert.equal(sacBypassRes.status, 403, `Expected 403 Forbidden, received: ${sacBypassRes.status}`);
  assert.ok(
    sacBypassRes.data.message.includes('Teacher permission is required'),
    `Unexpected error message: ${sacBypassRes.data.message}`
  );
  console.log(`  ✅ TEST 7 PASSED: Direct SAC creation rejected with 403 Forbidden: "${sacBypassRes.data.message}"\n`);

  // ----------------------------------------------------
  // TEST 8 — STUDENT CREATION SECURITY: 403 Forbidden
  // ----------------------------------------------------
  console.log('TEST 8 — STUDENT CREATION SECURITY:');
  console.log('  Testing that Student cannot create events...');

  const studentCreateRes = await request('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      ...teacherEventData,
      title: 'Unauthorized Student Event',
    },
  });

  assert.equal(studentCreateRes.status, 403, `Expected 403 Forbidden for student, received: ${studentCreateRes.status}`);
  console.log(`  ✅ TEST 8 PASSED: Student event creation rejected with 403 Forbidden: "${studentCreateRes.data.message}"\n`);

  console.log('====================================================');
  console.log('🎉 ALL 8 EXACT WORKFLOW TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
