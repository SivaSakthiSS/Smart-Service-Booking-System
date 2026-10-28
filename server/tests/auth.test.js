import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { config } from '../src/config/environment.js';
import User, { ROLES, ACCOUNT_STATUS } from '../src/models/User.js';

describe('Smart Service Hub Auth & RBAC Test Suite', () => {
  const timestamp = Date.now();
  const testCustomerEmail = `test_customer_${timestamp}@example.com`;
  const testAdminEmail = `test_admin_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  before(async () => {
    process.env.NODE_ENV = 'test';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    }
    // Clean up any lingering test users from prior runs
    await User.deleteMany({ email: /test_.*@example\.com/i });
  });

  after(async () => {
    // Clean up created test users
    await User.deleteMany({ email: /test_.*@example\.com/i });
    await mongoose.connection.close();
    setTimeout(() => process.exit(0), 100);
  });

  it('1. Rejects registration with invalid input (short password, bad email)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'A', // too short (< 2)
        email: 'invalid-email-format',
        password: 'short' // too short (< 8)
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(res.body.error.details));
    assert.ok(res.body.error.details.length >= 2);
  });

  it('2. Successfully registers a new customer with default CUSTOMER role and establishes session', async () => {
    const agent = request.agent(app);

    const res = await agent
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Customer',
        email: testCustomerEmail,
        password: testPassword
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testCustomerEmail);
    assert.equal(res.body.data.user.role, ROLES.CUSTOMER);
    assert.equal(res.body.data.user.accountStatus, ACCOUNT_STATUS.ACTIVE);
    assert.equal(res.body.data.user.password, undefined, 'Password must never be exposed');

    // Verify session cookie was set
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Session cookie must be set');
    assert.ok(cookies.some((c) => c.includes('ssh_session')), 'Must contain ssh_session cookie');

    // Verify session restoration on /me
    const meRes = await agent.get('/api/v1/auth/me');
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.data.user.email, testCustomerEmail);
  });

  it('3. Rejects duplicate registration with the same email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Duplicate User',
        email: testCustomerEmail,
        password: testPassword
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'EMAIL_ALREADY_EXISTS');
  });

  it('4. Rejects public attempts to register with role ADMIN (forces CUSTOMER role)', async () => {
    const maliciousEmail = `test_escalate_${timestamp}@example.com`;

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Hacker Attempt',
        email: maliciousEmail,
        password: testPassword,
        role: 'ADMIN' // Malicious role specification
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.role, ROLES.CUSTOMER, 'Role must strictly remain CUSTOMER');

    // Verify directly in database
    const savedUser = await User.findOne({ email: maliciousEmail });
    assert.equal(savedUser.role, ROLES.CUSTOMER, 'Database role must strictly be CUSTOMER');
  });

  it('5. Rejects login with non-existent email with generic error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'does_not_exist@example.com',
        password: 'AnyPassword123!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Invalid email or password.');
  });

  it('6. Rejects login with incorrect password with generic error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testCustomerEmail,
        password: 'WrongPassword999!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Invalid email or password.');
  });

  it('7. Successfully logs in with valid credentials and sets session cookie', async () => {
    const agent = request.agent(app);

    const res = await agent
      .post('/api/v1/auth/login')
      .send({
        email: testCustomerEmail,
        password: testPassword
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testCustomerEmail);
    assert.equal(res.body.data.user.password, undefined);

    const cookies = res.headers['set-cookie'];
    assert.ok(cookies.some((c) => c.includes('ssh_session')));
  });

  it('8. Rejects anonymous access to protected GET /api/v1/auth/me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHENTICATED');
  });

  it('9. Invalidate server-side session on logout', async () => {
    const agent = request.agent(app);

    // 1. Log in
    const loginRes = await agent.post('/api/v1/auth/login').send({
      email: testCustomerEmail,
      password: testPassword
    });
    assert.equal(loginRes.status, 200);

    // 2. Verify authenticated
    const meRes = await agent.get('/api/v1/auth/me');
    assert.equal(meRes.status, 200);

    // 3. Log out
    const logoutRes = await agent.post('/api/v1/auth/logout');
    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.body.success, true);

    // 4. Verify subsequent request to /me is rejected (session invalidated)
    const afterLogoutRes = await agent.get('/api/v1/auth/me');
    assert.equal(afterLogoutRes.status, 401);
  });

  it('10. Enforces Role-Based Access Control: CUSTOMER cannot access ADMIN route', async () => {
    const agent = request.agent(app);

    // Log in as CUSTOMER
    await agent.post('/api/v1/auth/login').send({
      email: testCustomerEmail,
      password: testPassword
    });

    // Attempt to access admin dashboard
    const adminRes = await agent.get('/api/v1/admin/dashboard-stats');
    assert.equal(adminRes.status, 403);
    assert.equal(adminRes.body.success, false);
    assert.equal(adminRes.body.error.code, 'FORBIDDEN_ROLE');
  });

  it('11. Allows ADMIN role to access protected admin route', async () => {
    // Provision test admin directly in DB
    const adminUser = new User({
      name: 'Test Administrator',
      email: testAdminEmail,
      password: testPassword,
      role: ROLES.ADMIN,
      accountStatus: ACCOUNT_STATUS.ACTIVE
    });
    await adminUser.save();

    const agent = request.agent(app);

    // Log in as ADMIN
    const loginRes = await agent.post('/api/v1/auth/login').send({
      email: testAdminEmail,
      password: testPassword
    });
    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.data.user.role, ROLES.ADMIN);

    // Access admin dashboard
    const adminRes = await agent.get('/api/v1/admin/dashboard-stats');
    assert.equal(adminRes.status, 200);
    assert.equal(adminRes.body.success, true);
    assert.ok(adminRes.body.data.counts.totalUsers >= 2);
    assert.equal(adminRes.body.data.systemStatus, 'OPERATIONAL');
  });
});
