import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fsPromises } from 'fs';

// System configuration file path
const CONFIG_FILE = path.join(process.cwd(), 'data', 'system-config.json');

// Default system configuration
const DEFAULT_CONFIG = {
  siteName: 'Forward Africa',
  siteDescription: 'Empowering African professionals through expert-led courses',
  maintenanceMode: false,
  debugMode: false,
  maxUploadSize: 50,
  sessionTimeout: 30,
  emailNotifications: true,
  autoBackup: true,
  backupFrequency: 'daily',
  securityLevel: 'high',
  rateLimiting: true,
  maxRequestsPerMinute: 100,
  databaseConnectionPool: 10,
  cacheEnabled: true,
  cacheTTL: 3600,
  cdnEnabled: false,
  sslEnabled: true,
  corsEnabled: true,
  allowedOrigins: ['https://forwardafrica.com', 'https://www.forwardafrica.com']
};

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.dirname(CONFIG_FILE);
  try {
    await fsPromises.access(dataDir);
  } catch {
    await fsPromises.mkdir(dataDir, { recursive: true });
  }
};

// Load system configuration
const loadConfig = async () => {
  try {
    await ensureDataDir();
    const configData = await fsPromises.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    // If file doesn't exist or is invalid, return default config
    console.log('No existing system config found, using defaults');
    return DEFAULT_CONFIG;
  }
};

// Save system configuration
const saveConfig = async (config: any) => {
  await ensureDataDir();
  await fsPromises.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Get system configuration
      const config = await loadConfig();
      res.status(200).json(config);
    } else if (req.method === 'PUT') {
      // Update system configuration
      const updatedConfig = req.body;

      // Validate the configuration
      if (!updatedConfig || typeof updatedConfig !== 'object') {
        return res.status(400).json({ error: 'Invalid configuration data' });
      }

      // Merge with existing config to preserve any missing fields
      const currentConfig = await loadConfig();
      const mergedConfig = { ...currentConfig, ...updatedConfig };

      // Save the updated configuration
      await saveConfig(mergedConfig);

      console.log('✅ System configuration updated successfully');
      res.status(200).json({
        success: true,
        message: 'System configuration saved successfully!',
        config: mergedConfig
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ System config error:', error);

    let errorMessage = 'Configuration operation failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

