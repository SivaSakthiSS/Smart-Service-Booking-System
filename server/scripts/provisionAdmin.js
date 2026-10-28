import mongoose from 'mongoose';
import { config, sanitizeUri } from '../src/config/environment.js';
import User, { ROLES, ACCOUNT_STATUS } from '../src/models/User.js';

/**
 * Safe Local Admin Provisioning Script.
 * Never exposes credentials in logs.
 * Usage:
 *   ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePassword123!" node scripts/provisionAdmin.js
 */
async function provisionAdmin() {
  const adminName = process.env.ADMIN_NAME || 'Platform Administrator';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@smartservicehub.local').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@SecurePass2026!';

  if (adminPassword.length < 8) {
    console.error('[Admin Provisioning Error] ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  console.log(`[Admin Provisioning] Connecting to MongoDB: ${config.sanitizedMongoUri}`);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });

  try {
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      existingUser.role = ROLES.ADMIN;
      existingUser.accountStatus = ACCOUNT_STATUS.ACTIVE;
      existingUser.password = adminPassword; // Triggers pre-save bcrypt hook
      await existingUser.save();
      console.log(`[Admin Provisioning Success] Updated existing user "${adminEmail}" to role: ${ROLES.ADMIN}.`);
    } else {
      const newAdmin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        isEmailVerified: true
      });
      await newAdmin.save();
      console.log(`[Admin Provisioning Success] Successfully provisioned new administrator "${adminEmail}" with role: ${ROLES.ADMIN}.`);
    }

    console.log('[Admin Provisioning Note] Store your credentials securely. Admin accounts must never be registered via public API.');
  } catch (err) {
    console.error(`[Admin Provisioning Failed]: ${sanitizeUri(err.message)}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('[Admin Provisioning] Database connection closed.');
    process.exit(0);
  }
}

provisionAdmin();
