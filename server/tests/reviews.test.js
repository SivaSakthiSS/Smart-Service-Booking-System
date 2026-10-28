import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { config } from '../src/config/environment.js';
import User, { ROLES } from '../src/models/User.js';
import Service from '../src/models/Service.js';
import Booking from '../src/models/Booking.js';
import Review from '../src/models/Review.js';

describe('Smart Service Hub Reviews & Ratings Aggregations Suite', () => {
  const ts = Date.now();
  const providerEmail = `prov_rev_${ts}@example.com`;
  const customerEmail = `cust_rev_${ts}@example.com`;
  const testPassword = 'Password123!';

  let providerAgent;
  let customerAgent;
  let anonAgent;

  let providerUser;
  let customerUser;
  let testService;
  let completedBooking;
  let pendingBooking;

  before(async () => {
    process.env.NODE_ENV = 'test';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    anonAgent = request.agent(app);
    providerAgent = request.agent(app);
    customerAgent = request.agent(app);

    // Register provider
    await providerAgent
      .post('/api/v1/auth/register')
      .send({ name: 'Reviewable Provider', email: providerEmail, password: testPassword });

    providerUser = await User.findOneAndUpdate(
      { email: providerEmail },
      {
        role: ROLES.PROVIDER,
        providerProfile: {
          businessName: 'Reviewable AC Services',
          bio: 'Top-rated HVAC specialist.',
          hourlyRate: 65,
          isApproved: true,
          ratingAverage: 0,
          ratingCount: 0
        }
      },
      { new: true }
    );

    // Register customer
    await customerAgent
      .post('/api/v1/auth/register')
      .send({ name: 'Reviewing Customer', email: customerEmail, password: testPassword });

    customerUser = await User.findOne({ email: customerEmail });

    // Create service
    testService = await Service.create({
      title: 'AC Gas Refill & Compressor Check',
      slug: `ac-gas-refill-${ts}`,
      description: 'Comprehensive refrigeration diagnostic.',
      category: 'hvac',
      provider: providerUser._id,
      price: 80,
      pricingType: 'fixed',
      estimatedDurationMinutes: 60,
      isActive: true,
      ratingAverage: 0,
      ratingCount: 0
    });

    // Create completed booking
    completedBooking = await Booking.create({
      bookingReference: `BK-REV-COMP-${ts}`,
      customer: customerUser._id,
      provider: providerUser._id,
      service: testService._id,
      status: 'completed',
      scheduledDate: new Date(),
      timeSlot: '10:00 AM',
      serviceLocation: { street: '10 Park St', city: 'Delhi', postalCode: '110001' },
      totalAmount: 80,
      paymentStatus: 'completed',
      completedAt: new Date()
    });

    // Create pending booking
    pendingBooking = await Booking.create({
      bookingReference: `BK-REV-PEND-${ts}`,
      customer: customerUser._id,
      provider: providerUser._id,
      service: testService._id,
      status: 'pending',
      scheduledDate: new Date(Date.now() + 86400000),
      timeSlot: '02:00 PM',
      serviceLocation: { street: '10 Park St', city: 'Delhi', postalCode: '110001' },
      totalAmount: 80,
      paymentStatus: 'pending'
    });
  });

  after(async () => {
    await Review.deleteMany({ service: testService?._id });
    await Booking.deleteMany({ service: testService?._id });
    await Service.deleteMany({ _id: testService?._id });
    await User.deleteMany({ email: { $in: [providerEmail, customerEmail] } });
    await mongoose.connection.close();
    setTimeout(() => process.exit(0), 100);
  });

  it('1. Rejects unauthenticated review post (401)', async () => {
    const res = await anonAgent
      .post('/api/v1/reviews')
      .send({
        bookingId: completedBooking._id,
        rating: 5,
        comment: 'Great service overall.'
      });

    assert.equal(res.status, 401);
  });

  it('2. Rejects review on a booking that has NOT completed (400)', async () => {
    const res = await customerAgent
      .post('/api/v1/reviews')
      .send({
        bookingId: pendingBooking._id,
        rating: 5,
        comment: 'Service has not taken place yet.'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'BOOKING_NOT_COMPLETED');
  });

  it('3. Rejects invalid rating numbers (e.g. 6 or negative) (422)', async () => {
    const res = await customerAgent
      .post('/api/v1/reviews')
      .send({
        bookingId: completedBooking._id,
        rating: 6,
        comment: 'Too high rating test.'
      });

    assert.equal(res.status, 422);
  });

  it('4. Successfully posts review for completed booking (201)', async () => {
    const res = await customerAgent
      .post('/api/v1/reviews')
      .send({
        bookingId: completedBooking._id,
        rating: 5,
        comment: 'Excellent work! AC cools down the master bedroom in minutes now.'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.review.rating, 5);
  });

  it('5. Automatically updates rating aggregates on Service and Provider', async () => {
    // Wait briefly for async recalculation
    await new Promise((r) => setTimeout(r, 100));

    const updatedService = await Service.findById(testService._id);
    assert.equal(updatedService.ratingAverage, 5);
    assert.equal(updatedService.ratingCount, 1);

    const updatedProvider = await User.findById(providerUser._id);
    assert.equal(updatedProvider.providerProfile.ratingAverage, 5);
    assert.equal(updatedProvider.providerProfile.ratingCount, 1);
  });

  it('6. Rejects duplicate review on the same booking (409)', async () => {
    const res = await customerAgent
      .post('/api/v1/reviews')
      .send({
        bookingId: completedBooking._id,
        rating: 4,
        comment: 'Attempting to review again.'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'REVIEW_ALREADY_EXISTS');
  });

  it('7. Public visitor can retrieve service reviews list', async () => {
    const res = await anonAgent.get(`/api/v1/reviews/service/${testService._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.reviews.length, 1);
    assert.equal(res.body.data.reviews[0].rating, 5);
  });
});
