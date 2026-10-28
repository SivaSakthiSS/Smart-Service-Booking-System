import mongoose from 'mongoose';
import { config } from '../src/config/environment.js';
import User, { ROLES, ACCOUNT_STATUS } from '../src/models/User.js';
import Service from '../src/models/Service.js';
import Booking from '../src/models/Booking.js';
import Review from '../src/models/Review.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database:', config.mongoUri);
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB.');

    // Clean existing seed collections
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('Creating Admin account...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'Admin1234!',
      role: ROLES.ADMIN,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: true
    });

    console.log('Creating Service Providers...');
    const providerPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya.cleaning@example.com',
      password: 'Provider1234!',
      role: ROLES.PROVIDER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      phoneNumber: '+91 98765 43210',
      address: {
        street: '42 MG Road, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India'
      },
      providerProfile: {
        businessName: 'SparklePro Deep Cleaning Solutions',
        bio: 'Certified eco-friendly deep cleaning specialists with over 6 years of experience serving residential and boutique commercial spaces.',
        skills: ['Deep Cleaning', 'Kitchen Degreasing', 'Carpet Shampooing', 'Move-out Cleaning'],
        experienceYears: 6,
        hourlyRate: 35,
        isApproved: true,
        ratingAverage: 5.0,
        ratingCount: 1
      }
    });

    const providerRajesh = await User.create({
      name: 'Rajesh Sharma',
      email: 'rajesh.plumbing@example.com',
      password: 'Provider1234!',
      role: ROLES.PROVIDER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      phoneNumber: '+91 98111 22334',
      address: {
        street: '15 Nehru Place',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110019',
        country: 'India'
      },
      providerProfile: {
        businessName: 'Rajesh Express Plumbing & Pipe Works',
        bio: 'Licensed master plumber handling residential leak emergency detection, drainage cleaning, and sanitary upgrades.',
        skills: ['Pipe Leak Repair', 'Drain Cleaning', 'Water Heaters', 'Tap Fitting'],
        experienceYears: 9,
        hourlyRate: 45,
        isApproved: true,
        ratingAverage: 4.8,
        ratingCount: 4
      }
    });

    const providerAmit = await User.create({
      name: 'Amit Kumar',
      email: 'amit.electric@example.com',
      password: 'Provider1234!',
      role: ROLES.PROVIDER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      phoneNumber: '+91 97234 56789',
      address: {
        street: '78 Linking Road, Bandra',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India'
      },
      providerProfile: {
        businessName: 'VoltMaster Electrical Innovations',
        bio: 'Certified industrial & domestic electrical engineer specializing in safe smart home installations and circuit diagnostics.',
        skills: ['Circuit Breaker Diagnostics', 'Smart Home Wiring', 'Lighting Installations', 'Appliance Earthing'],
        experienceYears: 8,
        hourlyRate: 50,
        isApproved: true,
        ratingAverage: 4.9,
        ratingCount: 7
      }
    });

    const providerSunita = await User.create({
      name: 'Sunita Rao',
      email: 'sunita.hvac@example.com',
      password: 'Provider1234!',
      role: ROLES.PROVIDER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      phoneNumber: '+91 99456 78123',
      address: {
        street: '202 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India'
      },
      providerProfile: {
        businessName: 'ClimateCool HVAC Systems',
        bio: 'HVAC technician providing air conditioning repair, condenser cleaning, coolant refilling, and ventilation solutions.',
        skills: ['AC Maintenance', 'Compressor Repair', 'Ventilation', 'Gas Charging'],
        experienceYears: 7,
        hourlyRate: 55,
        isApproved: true,
        ratingAverage: 4.7,
        ratingCount: 3
      }
    });

    console.log('Creating Services...');
    const s1 = await Service.create({
      title: 'Full Home Deep Cleaning & Sanitization',
      slug: 'full-home-deep-cleaning-sanitization',
      description: 'Comprehensive 4-hour thorough sanitization including kitchen degreasing, bathroom descaling, vacuuming, floor polishing, and window cleaning with hospital-grade disinfectants.',
      category: 'home_cleaning',
      provider: providerPriya._id,
      price: 89,
      pricingType: 'fixed',
      estimatedDurationMinutes: 240,
      tags: ['cleaning', 'sanitization', 'deepclean', 'kitchen', 'home'],
      coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      ratingAverage: 5.0,
      ratingCount: 1
    });

    const s2 = await Service.create({
      title: 'Sofa, Mattress & Carpet Shampoo Wash',
      slug: 'sofa-mattress-carpet-shampoo-wash',
      description: 'Injection-extraction deep foam cleaning for fabric upholstery, sofas, and rugs. Eliminates allergens, dust mites, and persistent stains.',
      category: 'home_cleaning',
      provider: providerPriya._id,
      price: 49,
      pricingType: 'fixed',
      estimatedDurationMinutes: 120,
      tags: ['sofa', 'carpet', 'fabric', 'shampoo'],
      coverImage: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      ratingAverage: 4.8,
      ratingCount: 2
    });

    const s3 = await Service.create({
      title: 'Emergency Pipe Leak & Blockage Repair',
      slug: 'emergency-pipe-leak-blockage-repair',
      description: 'Rapid on-site dispatch to inspect and fix burst pipes, leaking joints, low water pressure issues, and severe drain clogs using high-pressure jetting.',
      category: 'plumbing',
      provider: providerRajesh._id,
      price: 65,
      pricingType: 'hourly',
      estimatedDurationMinutes: 60,
      tags: ['plumbing', 'emergency', 'leak', 'drain', 'pipes'],
      coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      ratingAverage: 4.8,
      ratingCount: 4
    });

    const s4 = await Service.create({
      title: 'Bathroom Fixture & Water Heater Installation',
      slug: 'bathroom-fixture-water-heater-installation',
      description: 'Professional installation of geysers/water heaters, luxury rain showers, mixers, commodes, and vanity sinks with pressure testing.',
      category: 'plumbing',
      provider: providerRajesh._id,
      price: 110,
      pricingType: 'fixed',
      estimatedDurationMinutes: 150,
      tags: ['bathroom', 'geyser', 'heater', 'tap', 'fixture'],
      coverImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      ratingAverage: 4.9,
      ratingCount: 3
    });

    const s5 = await Service.create({
      title: 'Smart Home Lighting & Switchboard Rewiring',
      slug: 'smart-home-lighting-switchboard-rewiring',
      description: 'Safe wiring, installation of smart WiFi switches, dimmer panels, chandelier suspension, and modern architectural recessed LED strips.',
      category: 'electrical',
      provider: providerAmit._id,
      price: 55,
      pricingType: 'hourly',
      estimatedDurationMinutes: 90,
      tags: ['electrical', 'smart home', 'lighting', 'switches', 'led'],
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      ratingAverage: 4.9,
      ratingCount: 5
    });

    const s6 = await Service.create({
      title: 'Circuit Breaker & Fuse Box Upgrade',
      slug: 'circuit-breaker-fuse-box-upgrade',
      description: 'Eliminate tripping hazards and surge vulnerability with a modern RCCB/MCB distribution board replacement and load balancing.',
      category: 'electrical',
      provider: providerAmit._id,
      price: 125,
      pricingType: 'fixed',
      estimatedDurationMinutes: 120,
      tags: ['circuit breaker', 'mcb', 'safety', 'electrical'],
      coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      ratingAverage: 5.0,
      ratingCount: 2
    });

    const s7 = await Service.create({
      title: 'Split AC Deep Foam Cleaning & Coolant Recharge',
      slug: 'split-ac-deep-foam-cleaning-coolant-recharge',
      description: 'Full AC indoor unit jet wash, antimicrobial coil treatment, outdoor condenser inspection, gas pressure check, and coolant top-up.',
      category: 'hvac',
      provider: providerSunita._id,
      price: 75,
      pricingType: 'fixed',
      estimatedDurationMinutes: 90,
      tags: ['ac', 'hvac', 'cooling', 'service', 'air conditioner'],
      coverImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      ratingAverage: 4.7,
      ratingCount: 3
    });

    const s8 = await Service.create({
      title: 'Interior Wall Accent Painting & Texture Work',
      slug: 'interior-wall-accent-painting-texture-work',
      description: 'Premium dustless surface preparation, primer coat, and two coats of washable low-VOC luxury emulsion or geometric textured finishes.',
      category: 'painting',
      provider: providerPriya._id,
      price: 160,
      pricingType: 'fixed',
      estimatedDurationMinutes: 300,
      tags: ['painting', 'walls', 'interior', 'texture', 'renovation'],
      coverImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      ratingAverage: 5.0,
      ratingCount: 1
    });

    console.log('Creating Customer...');
    const customerUser = await User.create({
      name: 'Sneha Patel',
      email: 'customer@example.com',
      password: 'Customer1234!',
      role: ROLES.CUSTOMER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      phoneNumber: '+91 99887 76655',
      address: {
        street: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560103',
        country: 'India'
      },
      isEmailVerified: true
    });

    console.log('Creating Bookings...');
    // 1. Completed booking
    const bookingCompleted = await Booking.create({
      bookingReference: 'BK-SAMPLE-01',
      customer: customerUser._id,
      provider: providerPriya._id,
      service: s1._id,
      status: 'completed',
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      timeSlot: '09:00 AM - 01:00 PM',
      serviceLocation: {
        street: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560103',
        specialInstructions: 'Ring bell on 4th floor. Service elevator available.'
      },
      totalAmount: s1.price,
      paymentStatus: 'completed',
      customerNotes: 'Please pay extra attention to kitchen tile grout.',
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)
    });

    // 2. Confirmed upcoming booking
    const bookingConfirmed = await Booking.create({
      bookingReference: 'BK-SAMPLE-02',
      customer: customerUser._id,
      provider: providerRajesh._id,
      service: s3._id,
      status: 'confirmed',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      timeSlot: '11:00 AM - 12:00 PM',
      serviceLocation: {
        street: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560103'
      },
      totalAmount: s3.price,
      paymentStatus: 'pending',
      customerNotes: 'Slow drain in guest bathroom washbasin.'
    });

    // 3. Pending booking
    const bookingPending = await Booking.create({
      bookingReference: 'BK-SAMPLE-03',
      customer: customerUser._id,
      provider: providerAmit._id,
      service: s5._id,
      status: 'pending',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      timeSlot: '02:00 PM - 03:30 PM',
      serviceLocation: {
        street: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560103'
      },
      totalAmount: s5.price,
      paymentStatus: 'pending',
      customerNotes: 'Need 3 smart dimmer switches connected to dining lights.'
    });

    console.log('Creating Verified Review...');
    await Review.create({
      booking: bookingCompleted._id,
      service: s1._id,
      customer: customerUser._id,
      provider: providerPriya._id,
      rating: 5,
      comment: 'Priya and her team did a phenomenal job! Our home looks and smells brand new. Extremely courteous, punctual, and meticulous. Will book again!'
    });

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Admin:    admin@example.com / Admin1234!');
    console.log('Provider: priya.cleaning@example.com / Provider1234!');
    console.log('Customer: customer@example.com / Customer1234!');
    console.log('----------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
