import { NextRequest, NextResponse } from 'next/server';
import { db } from '@ultra/db';
import { apiEndpoints, apiTrafficLogs } from '@ultra/db/src/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// Generic handler for ALL methods
async function handleRequest(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const startTime = Date.now();
  const slugArray = params.slug || [];
  const pathSlug = slugArray.join('/');
  const method = request.method;
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown IP';
  
  let responseStatus = 500;
  let responseData: any = null;
  let requestPayloadStr = '';
  let endpointId = '';

  try {
    // 1. Extract payload for logging (Masking sensitive info later)
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const clonedReq = request.clone();
        const json = await clonedReq.json();
        // Masking basic PII for ultra security
        if (json.password) json.password = '***REDACTED***';
        if (json.token) json.token = '***REDACTED***';
        requestPayloadStr = JSON.stringify(json).substring(0, 2000); // Limit length
      } catch (e) {
        requestPayloadStr = 'Could not parse payload';
      }
    }

    // 2. Find Route Configuration in Matrix
    const endpoints = await db.select().from(apiEndpoints)
      .where(and(
        eq(apiEndpoints.pathSlug, pathSlug),
        eq(apiEndpoints.isActive, true)
      ))
      .limit(1);

    const endpoint = endpoints[0];

    if (!endpoint) {
      responseStatus = 404;
      return NextResponse.json({ 
        ultra_status: 'ERROR', 
        message: `Endpoint /${pathSlug} not found or inactive in the Matrix.` 
      }, { status: 404 });
    }

    endpointId = endpoint.id;

    // Validate Method Method Mismatch
    if (endpoint.method !== 'ALL' && endpoint.method !== method) {
      responseStatus = 405;
      return NextResponse.json({ 
        ultra_status: 'ERROR', 
        message: `Method ${method} not allowed for this endpoint. Expected ${endpoint.method}.` 
      }, { status: 405 });
    }

    // 3. API Key Validation (Ultra Security)
    if (endpoint.requireAuth) {
      const apiKey = request.headers.get('x-ultra-api-key');
      if (!apiKey) {
        responseStatus = 401;
        return NextResponse.json({ ultra_status: 'ERROR', message: 'Missing x-ultra-api-key header.' }, { status: 401 });
      }
      // Note: Real implementation would verify against apiKeys table using hashed token
      // For now we simulate an ultra fast bypass check
      if (apiKey !== 'ultra-dev-secret-123') {
        responseStatus = 403;
        return NextResponse.json({ ultra_status: 'ERROR', message: 'Invalid API Key.' }, { status: 403 });
      }
    }

    // 4. Execution Engine
    if (endpoint.routingType === 'AUTOMATIC') {
      // --- AUTOMATIC ROUTING (Dynamic Proxy) ---
      if (!endpoint.targetUrl) {
        throw new Error("Target URL is missing for AUTOMATIC routing.");
      }

      // Append query params
      const searchParams = request.nextUrl.search;
      const finalTargetUrl = `${endpoint.targetUrl}${searchParams}`;

      // Forward headers
      const headers = new Headers();
      headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
      headers.set('User-Agent', 'Ultramodul API Exchange/1.0');

      // Forward Payload
      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = request.body;
        // Need to enable duplex for fetch with stream
        (fetchOptions as any).duplex = 'half';
      }

      // Execute Proxy
      const proxyRes = await fetch(finalTargetUrl, fetchOptions);
      responseStatus = proxyRes.status;
      
      const contentType = proxyRes.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await proxyRes.json();
      } else {
        responseData = await proxyRes.text();
      }

      return NextResponse.json(responseData, { status: responseStatus });

    } else if (endpoint.routingType === 'MANUAL') {
      // --- MANUAL ROUTING (Custom Handlers) ---
      
      if (endpoint.handlerName === 'mockSuccessHandler') {
        responseStatus = 200;
        return NextResponse.json({ ultra_status: 'SUCCESS', message: 'Manual handler executed perfectly!', data: { ts: Date.now() } });
      }
      
      if (endpoint.handlerName === 'nexusDataFetcher') {
        responseStatus = 200;
        return NextResponse.json({ ultra_status: 'SUCCESS', nexus_data: "Virtual Dataset Mock" });
      }

      throw new Error(`Handler '${endpoint.handlerName}' not recognized by the Ultra Engine.`);
    }

    throw new Error("Unknown routing type.");

  } catch (error: any) {
    responseStatus = 500;
    return NextResponse.json({ 
      ultra_status: 'FATAL_ERROR', 
      message: error.message || 'Internal Exchange Engine Error' 
    }, { status: 500 });
  } finally {
    // 5. Ultra Blackbox Logging
    const latency = Date.now() - startTime;
    
    // Asynchronous logging to prevent blocking response
    db.insert(apiTrafficLogs).values({
      id: crypto.randomUUID(),
      endpointId: endpointId || null,
      requestPath: `/${pathSlug}`,
      requestMethod: method,
      requestPayload: requestPayloadStr,
      responseStatus,
      latencyMs: latency,
      ipAddress,
      timestamp: new Date()
    }).catch(err => console.error("Ultra Logging Failed:", err));
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
