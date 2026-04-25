/**
 * WhatsApp Service - Barmagly Salon
 *
 * Supports multiple providers:
 * 1. WhatsApp Cloud API (Meta official) - for automated messages
 * 2. Webhook forwarding - for custom WhatsApp gateways
 * 3. wa.me deep links - for manual click-to-send
 *
 * Configuration stored in app_settings table:
 * - whatsapp_api_token: Cloud API access token
 * - whatsapp_phone_id: Cloud API phone number ID
 * - whatsapp_webhook_url: Custom webhook URL for message forwarding
 * - whatsapp_enabled: Enable/disable automated messages
 */

import { db } from "./db";
import { appSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., +41791234567)
  message: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
}

// Cache settings to avoid DB lookups on every message
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

/**
 * Send a WhatsApp message using the configured provider
 */
export async function sendWhatsAppMessage(msg: WhatsAppMessage): Promise<boolean> {
  const settings = await getSettings();

  if (settings.whatsapp_enabled !== 'true') {
    console.log(`[WhatsApp] Disabled - skipping message to ${msg.to}`);
    return false;
  }

  // Clean phone number
  const phone = msg.to.replace(/[^0-9+]/g, '');
  if (!phone || phone.length < 8) return false;

  // Try WhatsApp Cloud API first
  if (settings.whatsapp_api_token && settings.whatsapp_phone_id) {
    return sendViaCloudAPI(phone, msg.message, settings);
  }

  // Try webhook
  if (settings.whatsapp_webhook_url) {
    return sendViaWebhook(phone, msg.message, settings.whatsapp_webhook_url);
  }

  console.log(`[WhatsApp] No provider configured - message to ${phone}: ${msg.message.substring(0, 50)}...`);
  return false;
}

/**
 * Send via WhatsApp Cloud API (Meta official)
 */
async function sendViaCloudAPI(phone: string, message: string, settings: Record<string, string>): Promise<boolean> {
  try {
    const phoneId = settings.whatsapp_phone_id;
    const token = settings.whatsapp_api_token;

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace('+', ''),
        type: 'text',
        text: { body: message },
      }),
    });

    if (response.ok) {
      console.log(`[WhatsApp Cloud API] Message sent to ${phone}`);
      return true;
    } else {
      const err = await response.text();
      console.error(`[WhatsApp Cloud API] Failed: ${err}`);
      return false;
    }
  } catch (err) {
    console.error('[WhatsApp Cloud API] Error:', err);
    return false;
  }
}

/**
 * Send via custom webhook (supports any WhatsApp gateway)
 */
async function sendViaWebhook(phone: string, message: string, webhookUrl: string): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message, timestamp: Date.now() }),
    });

    if (response.ok) {
      console.log(`[WhatsApp Webhook] Message sent to ${phone}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[WhatsApp Webhook] Error:', err);
    return false;
  }
}

/**
 * Generate a wa.me deep link for manual sending
 */
export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

/**
 * Send notification via WhatsApp to a salon admin
 * Looks up the salon's whatsapp_number
 */
export async function notifySalonViaWhatsApp(salonId: string, message: string): Promise<void> {
  try {
    const { salons } = require("@shared/schema");
    const [salon] = await db.select().from(salons).where(eq(salons.id, salonId));
    if (salon?.whatsappNumber) {
      await sendWhatsAppMessage({ to: salon.whatsappNumber, message });
    }
  } catch (err) {
    console.warn('[WhatsApp] Failed to notify salon:', err);
  }
}

/**
 * Send notification to super admin via WhatsApp
 */
export async function notifySuperAdminViaWhatsApp(message: string): Promise<void> {
  const settings = await getSettings();
  const adminPhone = settings.whatsapp_admin_number;
  if (adminPhone) {
    await sendWhatsAppMessage({ to: adminPhone, message });
  }
}
