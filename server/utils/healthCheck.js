// Health Check Route for Docker
// Add this to your Express server.js or routes

import mongoose from 'mongoose';

/* eslint-disable no-undef */

export const setupHealthCheck = (app) => {
  // Health check endpoint for Docker/Load Balancers
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  });

  // Readiness check - ensures all dependencies are ready
  app.get('/health/ready', async (req, res) => {
    try {
      // Check MongoDB connection
      const mongoConnected = mongoose.connection.readyState === 1;
      
      if (!mongoConnected) {
        return res.status(503).json({
          status: 'not_ready',
          reason: 'Database not connected',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        mongodb: 'connected',
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(503).json({
        status: 'not_ready',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Liveness check - simple indicator that app is running
  app.get('/health/live', (req, res) => {
    res.status(200).json({
      status: 'live',
      timestamp: new Date().toISOString()
    });
  });
};
