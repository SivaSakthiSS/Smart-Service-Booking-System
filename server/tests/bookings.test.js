import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { config } from '../src/config/environment.js';
import User, { ROLES } from '../src/models/User.js';
import Service from '../src/models/Service.js';
import Booking from '../src/models/Booking.js';

describe('Smart Service Hub Bookings Lifecycle & State Machine Suite', () => {
  const ts = Date.now();
  const providerEmail = `prov_book_${ts}@example.com`;
  const customerEmail = `cust_book_${ts}@example.com`;
  const otherCustomerEmail = `other_cust_${ts}@example.com`;
  const testPassword = 'Password123!';

  let providerAgent;
  let customerAgent;
  let otherCustomerAgent;
  let anonAgent;

  let testService;
  let createdBookingId;
  let secondBookingId;

  before(async () => {
    process.env.NODE_ENV = 'test';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    anonAgent = request.agent(app);
    providerAgent = request.agent(app);
    customerAgent = request.agent(app);
    otherCustomerAgent = request.agent(app);

    // Register provider
    await providerAgent
      .post('/api/v1/auth/register')
      .send({ name: 'Bookable Provider', email: providerEmail, password: testPassword });

    const providerUser = await User.findOneAndUpdate(
      { email: providerEmail },
      {
        role: ROLES.PROVIDER,
        providerProfile: {
          businessName: 'Bookable Services Co.',
          bio: 'Always on time and certified.',
          skills: ['Electrical'],
          hourlyRate: 60,
          isApproved: true
        }
      },
      { new: true }
    );

    // Register primary customer
    await customerAgent
      .post('/api/v1/auth/register')
      .send({ name: 'Booking Customer', email: customerEmail, password: testPassword });

    // Register secondary customer
    await otherCustomerAgent
      .post('/api/v1/auth/register')
      .send({ name: 'Other Customer', email: otherCustomerEmail, password: testPassword });

    // Create test service by provider
    testService = await Service.create({
      title: 'Wiring Diagnostic & Repair',
      slug: `wiring-diagnostic-repair-${ts}`,
      description: 'Full electrical inspection and diagnostic test.',
      category: 'electrical',
      provider: providerUser._id,
      price: 90,
      pricingType: 'fixed',
      estimatedDurationMinutes: 90,
      isActive: true
    });
  });

  after(async () => {
    await Booking.deleteMany({ service: testService?._id });
    await Service.deleteMany({ _id: testService?._id });
    await User.deleteMany({ email: { $in: [providerEmail, customerEmail, otherCustomerEmail] } });
    await mongoose.connection.close();
    setTimeout(() => process.exit(0), 100);
  });

  it('1. Rejects unauthenticated request to create booking (401)', async () => {
    const res = await anonAgent
      .post('/api/v1/bookings')
      .send({
        serviceId: testService._id,
        scheduledDate: new Date(),
        timeSlot: '10:00 AM',
        serviceLocation: { street: '123 Main St', city: 'Metropolis', postalCode: '12345' }
      });

    assert.equal(res.status, 401);
  });

  it('2. Provider cannot book their own service (400)', async () => {
    const res = await providerAgent
      .post('/api/v1/bookings')
      .send({
        serviceId: testService._id,
        scheduledDate: new Date(Date.now() + 86400000),
        timeSlot: '10:00 AM',
        serviceLocation: { street: '123 Main St', city: 'Metropolis', postalCode: '12345' }
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'SELF_BOOKING_PROHIBITED');
  });

  it('3. Customer creates a booking with pending status (201)', async () => {
    const res = await customerAgent
      .post('/api/v1/bookings')
      .send({
        serviceId: testService._id,
        scheduledDate: new Date(Date.now() + 86400000 * 2),
        timeSlot: '02:00 PM - 04:00 PM',
        serviceLocation: {
          street: '45 Lotus Tower, 5th Floor',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          specialInstructions: 'Ring doorbell twice.'
        },
        customerNotes: 'Main fuse occasionally trips under load.'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.booking.status, 'pending');
    assert.ok(res.body.data.booking.bookingReference.startsWith('BK-'));
    assert.equal(res.body.data.booking.totalAmount, 90);
    createdBookingId = res.body.data.booking._id;
  });

  it('4. Customer sees booking in their /my-bookings list', async () => {
    const res = await customerAgent.get('/api/v1/bookings/my-bookings');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.bookings.some((b) => b._id === createdBookingId));
  });

  it('5. Provider sees incoming booking dispatch in their /my-bookings list', async () => {
    const res = await providerAgent.get('/api/v1/bookings/my-bookings');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.bookings.some((b) => b._id === createdBookingId));
  });

  it('6. Third party customer is forbidden (403) from inspecting this booking', async () => {
    const res = await otherCustomerAgent.get(`/api/v1/bookings/${createdBookingId}`);
    assert.equal(res.status, 403);
  });

  it('7. Provider accepts booking: transitions pending -> confirmed', async () => {
    const res = await providerAgent
      .patch(`/api/v1/bookings/${createdBookingId}/status`)
      .send({ status: 'confirmed' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.booking.status, 'confirmed');
  });

  it('8. Provider starts job: transitions confirmed -> in_progress', async () => {
    const res = await providerAgent
      .patch(`/api/v1/bookings/${createdBookingId}/status`)
      .send({ status: 'in_progress' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.booking.status, 'in_progress');
  });

  it('9. Provider completes job: transitions in_progress -> completed', async () => {
    const res = await providerAgent
      .patch(`/api/v1/bookings/${createdBookingId}/status`)
      .send({ status: 'completed' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.booking.status, 'completed');
    assert.equal(res.body.data.booking.paymentStatus, 'completed');
    assert.ok(res.body.data.booking.completedAt);
  });

  it('10. Terminal state protection: cannot modify completed booking (400)', async () => {
    const res = await customerAgent
      .patch(`/api/v1/bookings/${createdBookingId}/status`)
      .send({ status: 'cancelled' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'TERMINAL_STATE');
  });

  it('11. Customer can cancel an unconfirmed pending booking', async () => {
    // Create second booking
    const createRes = await customerAgent
      .post('/api/v1/bookings')
      .send({
        serviceId: testService._id,
        scheduledDate: new Date(Date.now() + 86400000 * 4),
        timeSlot: '04:00 PM',
        serviceLocation: { street: '45 Lotus Tower', city: 'Bangalore', postalCode: '560001' }
      });

    secondBookingId = createRes.body.data.booking._id;

    const cancelRes = await customerAgent
      .patch(`/api/v1/bookings/${secondBookingId}/status`)
      .send({
        status: 'cancelled',
        cancellationReason: 'Plans changed; rescheduled.'
      });

    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.body.data.booking.status, 'cancelled');
    assert.equal(cancelRes.body.data.booking.cancellationReason, 'Plans changed; rescheduled.');
  });
});
