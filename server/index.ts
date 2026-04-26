import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { WebhookHandlers } from "./webhookHandlers";
import * as fs from "fs";
import * as path from "path";

const app = express();
app.set("trust proxy", 1);
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }

    // Allow barber.barmagly.tech
    origins.add("https://barber.barmagly.tech");
    origins.add("http://barber.barmagly.tech");

    const origin = req.header("origin");

    // Allow localhost origins for Expo web development (any port)
    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      const staticBuildIdx = path.resolve(process.cwd(), "static-build", "index.html");
      if (fs.existsSync(staticBuildIdx)) {
        return res.sendFile(staticBuildIdx);
      }
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  const staticBuildIndex = path.resolve(process.cwd(), "static-build", "index.html");
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/super_admin") ||
      req.path.startsWith("/uploads") ||
      req.path.startsWith("/assets") ||
      req.path.startsWith("/salon/")
    ) {
      return next();
    }
    if (fs.existsSync(staticBuildIndex)) {
      return res.sendFile(staticBuildIndex);
    }
    next();
  });

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

}

async function initStripe() {
  // Stripe sync (stripe-replit-sync) is disabled for MySQL deployment
  // Core Stripe API (payments, webhooks) still works via STRIPE_SECRET_KEY
  const hasLocalKeys = process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY;
  if (hasLocalKeys) {
    log('Stripe API keys found — payments enabled (sync disabled for MySQL)');
  } else {
    log('Stripe keys not found, skipping Stripe initialization');
  }
}

(async () => {
  log("Starting server initialization...");
  setupCors(app);

  // Rate limiting - general API
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" },
  });
  app.use("/api/", apiLimiter);

  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many authentication attempts, please try again later" },
  });
  app.use("/api/auth/signin", authLimiter);
  app.use("/api/auth/signup", authLimiter);

  // Serve the public directory for static file uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  app.get('/health', (req, res) => res.json({ status: 'ok', version: 'v2' }));

  // Serve Super Admin web portal
  const adminDistPath = path.join(process.cwd(), 'admin-dist');
  if (fs.existsSync(adminDistPath)) {
    app.use('/super_admin', express.static(adminDistPath));
    app.get('/super_admin/{*path}', (req, res) => {
      res.sendFile(path.join(adminDistPath, 'index.html'));
    });
    log("Super Admin portal serving from /super_admin");
  } else {
    log("Super Admin build not found at admin-dist/. Run: cd admin-panel && npm run build");
  }

  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }
      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  setupBodyParsing(app);
  setupRequestLogging(app);

  log("Configuring Expo and Landing...");
  configureExpoAndLanding(app);

  log("Initializing Stripe...");
  await initStripe();

  log("Ensuring schema...");
  try {
    const { pool } = await import("./db");
    // Add senderRole column to messages if it doesn't exist (idempotent)
    const [cols]: any = await (pool as any).query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'sender_role'"
    );
    if (!cols || cols.length === 0) {
      await (pool as any).query("ALTER TABLE messages ADD COLUMN sender_role TEXT DEFAULT ''");
      log("Added messages.sender_role column");
    }
    // recipient_user_id for thread isolation (per staff/admin)
    const [cols2]: any = await (pool as any).query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'recipient_user_id'"
    );
    if (!cols2 || cols2.length === 0) {
      await (pool as any).query("ALTER TABLE messages ADD COLUMN recipient_user_id VARCHAR(255) DEFAULT ''");
      log("Added messages.recipient_user_id column");
    }
    // Reels tables
    await (pool as any).query(`CREATE TABLE IF NOT EXISTS reels (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      user_name TEXT,
      user_avatar TEXT,
      salon_id VARCHAR(255) NOT NULL,
      salon_name TEXT,
      booking_id VARCHAR(255) DEFAULT '',
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      caption TEXT,
      rating INT DEFAULT 5,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      views INT DEFAULT 0,
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL,
      INDEX idx_reels_salon (salon_id),
      INDEX idx_reels_user (user_id),
      INDEX idx_reels_status (status)
    )`);
    await (pool as any).query(`CREATE TABLE IF NOT EXISTS reel_likes (
      id VARCHAR(255) PRIMARY KEY,
      reel_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_reel_user (reel_id, user_id)
    )`);
    await (pool as any).query(`CREATE TABLE IF NOT EXISTS reel_comments (
      id VARCHAR(255) PRIMARY KEY,
      reel_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      user_name TEXT,
      user_avatar TEXT,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_comments_reel (reel_id)
    )`);
  } catch (e: any) {
    console.warn("Schema ensure warning:", e?.message || e);
  }

  log("Registering routes...");
  const server = await registerRoutes(app);

  log("Setting up error handler...");
  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`express server serving on port ${port}`);
    },
  );
})();
