/**
 * Email Service - Barmagly Platform
 *
 * Sends emails via SMTP using nodemailer.
 * Configuration stored in app_settings table:
 * - smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, smtp_enabled
 */

import { db } from "./db";
import { appSettings } from "@shared/schema";

let settingsCache: Record<string, string> = {};
let lastCacheFetch = 0;

async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now - lastCacheFetch < 60000 && Object.keys(settingsCache).length > 0) return settingsCache;
  try {
    const settings = await db.select().from(appSettings);
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    settingsCache = map;
    lastCacheFetch = now;
    return map;
  } catch {
    return settingsCache;
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const settings = await getSettings();

  if (settings.smtp_enabled !== 'true') {
    console.log(`[Email] SMTP disabled - skipping email to ${to}: ${subject}`);
    return false;
  }

  const host = settings.smtp_host;
  const port = parseInt(settings.smtp_port || '587');
  const user = settings.smtp_user;
  const pass = settings.smtp_pass;
  const from = settings.smtp_from || user;

  if (!host || !user || !pass) {
    console.log('[Email] SMTP not configured - missing host/user/pass');
    return false;
  }

  try {
    // Dynamic import to avoid requiring nodemailer if not installed
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Barmagly Platform" <${from}>`,
      to,
      subject,
      html,
    });

    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error('[Email] Failed:', err);
    return false;
  }
}

export async function sendTrialRequestNotification(data: {
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  message: string;
}): Promise<boolean> {
  const settings = await getSettings();
  const adminEmail = settings.smtp_admin_email || settings.smtp_user;

  if (!adminEmail) {
    console.log('[Email] No admin email configured');
    return false;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F4A460, #e8923c); padding: 24px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #181A20;">New Trial Request</h1>
        <p style="margin: 8px 0 0; color: #181A20; opacity: 0.8;">A new salon wants to join Barmagly</p>
      </div>
      <div style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #999; width: 130px;">Salon Name</td><td style="padding: 8px 0; color: #fff; font-weight: 600;">${data.salonName}</td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Owner Name</td><td style="padding: 8px 0; color: #fff; font-weight: 600;">${data.ownerName}</td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #F4A460;">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Phone</td><td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #F4A460;">${data.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #999;">Location</td><td style="padding: 8px 0; color: #fff;">${data.city}${data.country ? ', ' + data.country : ''}</td></tr>
          ${data.message ? `<tr><td style="padding: 8px 0; color: #999; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #fff;">${data.message}</td></tr>` : ''}
        </table>
        <div style="margin-top: 24px; padding: 16px; background: rgba(244, 164, 96, 0.1); border-radius: 12px; border-left: 4px solid #F4A460;">
          <p style="margin: 0; color: #F4A460; font-size: 14px;">This salon requested a 14-day free trial. Please review and follow up.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail(adminEmail, `New Trial Request: ${data.salonName}`, html);
}
