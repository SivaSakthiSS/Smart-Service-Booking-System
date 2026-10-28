import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { config } from '../src/config/environment.js';
import User, { ROLES } from '../src/models/User.js';
import Service from '../src/models/Service.js';

describe('Smart Service Hub Services Catalog & Provider API Suite', () => {
  const ts = Date.now();
  const providerEmail = `prov_test_${ts}@example.com`;
  const customerEmail = `cust_test_${ts}@example.com`;
  const testPassword = 'Password123!';

  let providerAgent;
  let customerAgent;
  let anonAgent;
  let createdServiceId;

  before(async () => {
    process.env.NODE_ENV = 'test';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    anonAgent = request.agent(app);
    providerAgent = request.agent(app);
    customerAgent = request.agent(app);

    // Register and setup provider
    await providerAgent
      .post('/api/v1/auth/register')
      .send({ name: 'Test Provider User', email: providerEmail, password: testPassword });

    // Upgrade this user to PROVIDER directly in DB for testing
    await User.findOneAndUpdate(
      { email: providerEmail },
      {
        role: ROLES.PROVIDER,
        providerProfile: {
          businessName: 'Apex Plumbing Works',
          bio: 'Top-tier master plumbing service.',
          skills: ['Plumbing', 'Drain Cleaning'],
          experienceYears: 5,
          hourlyRate: 50,
          isApproved: true
        }
      }
    );

    // Register customer
    await customerAgent
      .post('/api/v1/auth/register')
      .send({ name: 'Test Regular Customer', email: customerEmail, password: testPassword });
  });

  after(async () => {
    await Service.deleteMany({ title: /Test Service/i });
    await User.deleteMany({ email: { $in: [providerEmail, customerEmail] } });
    await mongoose.connection.close();
    setTimeout(() => process.exit(0), 100);
  });

  it('1. GET /api/v1/services - Public visitor can retrieve service catalog', async () => {
    const res = await anonAgent.get('/api/v1/services');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.services));
    assert.ok(res.body.data.pagination);
  });

  it('2. GET /api/v1/services/categories - Public visitor can retrieve category breakdown', async () => {
    const res = await anonAgent.get('/api/v1/services/categories');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.categories));
  });

  it('3. POST /api/v1/services - Customer is prohibited (403 Forbidden) from creating services', async () => {
    const res = await customerAgent
      .post('/api/v1/services')
      .send({
        title: 'Customer Unauthorized Service',
        description: 'Should be rejected by RBAC.',
        category: 'home_cleaning',
        price: 50
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN_ROLE');
  });

  it('4. POST /api/v1/services - Provider can successfully create a new service listing', async () => {
    const res = await providerAgent
      .post('/api/v1/services')
      .send({
        title: 'Test Service: Advanced Pipe Repair',
        description: 'Comprehensive high pressure leak diagnosis and copper pipe soldering.',
        category: 'plumbing',
        price: 75,
        pricingType: 'hourly',
        estimatedDurationMinutes: 60,
        tags: ['plumbing', 'leak', 'emergency']
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.service.title, 'Test Service: Advanced Pipe Repair');
    assert.equal(res.body.data.service.price, 75);
    createdServiceId = res.body.data.service._id;
  });

  it('5. GET /api/v1/services/:id - Can retrieve single service details', async () => {
    const res = await anonAgent.get(`/api/v1/services/${createdServiceId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.service._id, createdServiceId);
    assert.ok(res.body.data.service.provider);
  });

  it('6. GET /api/v1/services/my-services - Provider can retrieve their own catalog', async () => {
    const res = await providerAgent.get('/api/v1/services/my-services');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.services.some((s) => s._id === createdServiceId));
  });

  it('7. PUT /api/v1/services/:id - Provider can update their service listing', async () => {
    const res = await providerAgent
      .put(`/api/v1/services/${createdServiceId}`)
      .send({
        price: 85,
        description: 'Updated description with expanded warranty.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.service.price, 85);
  });

  it('8. DELETE /api/v1/services/:id - Customer cannot delete provider service', async () => {
    const res = await customerAgent.delete(`/api/v1/services/${createdServiceId}`);
    assert.equal(res.status, 403);
  });

  it('9. DELETE /api/v1/services/:id - Owner provider can delete their service', async () => {
    const res = await providerAgent.delete(`/api/v1/services/${createdServiceId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify it is gone
    const verifyRes = await anonAgent.get(`/api/v1/services/${createdServiceId}`);
    assert.equal(verifyRes.status, 404);
  });
});
