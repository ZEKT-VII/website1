import { useState, useEffect } from 'react';

export interface CookieData {
  name: string;
  value: string;
  domain: string;
  expires: string;
}

export interface SystemData {
  cpuCores: number | string;
  deviceMemory: number | string;
  userAgent: string;
  platform: string;
  networkType: string;
  networkDownlink: string;
  networkRtt: string;
  localStorageSize: number;
  sessionStorageSize: number;
  cookieCount: number;
  cookies: CookieData[];
  resourceLogs: { name: string; duration: number; type: string }[];
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
}

export function useSystemData() {
  const [data, setData] = useState<SystemData>({
    cpuCores: 'UNKNOWN',
    deviceMemory: 'UNKNOWN',
    userAgent: '',
    platform: '',
    networkType: 'UNKNOWN',
    networkDownlink: 'UNKNOWN',
    networkRtt: 'UNKNOWN',
    localStorageSize: 0,
    sessionStorageSize: 0,
    cookieCount: 0,
    cookies: [],
    resourceLogs: [],
  });

  useEffect(() => {
    const updateData = async () => {
      // Basic navigator info
      const cpuCores = navigator.hardwareConcurrency || 'UNKNOWN';
      const deviceMemory = (navigator as any).deviceMemory || 'UNKNOWN';
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;

      // Network info
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const networkType = connection ? connection.effectiveType : 'UNKNOWN';
      const networkDownlink = connection ? connection.downlink + ' Mbps' : 'UNKNOWN';
      const networkRtt = connection ? connection.rtt + ' ms' : 'UNKNOWN';

      // Storage info
      let localStorageSize = 0;
      try {
        localStorageSize = new Blob(Object.values(localStorage)).size;
      } catch (e) {}

      let sessionStorageSize = 0;
      try {
        sessionStorageSize = new Blob(Object.values(sessionStorage)).size;
      } catch (e) {}

      const cookieCount = document.cookie ? document.cookie.split(';').length : 0;
      
      let cookiesData: CookieData[] = [];
      try {
        if ('cookieStore' in window) {
          const rawCookies = await (window as any).cookieStore.getAll();
          cookiesData = rawCookies.map((c: any) => ({
            name: c.name,
            value: c.value,
            domain: c.domain || 'N/A',
            expires: c.expires ? new Date(c.expires).toLocaleString() : 'Session'
          }));
        } else {
          cookiesData = document.cookie ? document.cookie.split(';').map(c => {
            const [name, ...rest] = c.split('=');
            return {
              name: name.trim(),
              value: rest.join('='),
              domain: window.location.hostname,
              expires: 'Unknown'
            };
          }) : [];
        }
      } catch (e) {
         // fallback if cookieStore fails due to security
      }

      // Memory info (Chrome specific)
      let memoryInfo = {};
      if ((performance as any).memory) {
        memoryInfo = {
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        };
      }

      // Performance resource timing
      const resources = performance.getEntriesByType('resource').slice(-30).map(r => ({
        name: r.name,
        duration: r.duration,
        type: (r as any).initiatorType || 'unknown'
      }));

      setData(prev => ({
        ...prev,
        cpuCores,
        deviceMemory,
        userAgent,
        platform,
        networkType,
        networkDownlink,
        networkRtt,
        localStorageSize,
        sessionStorageSize,
        cookieCount,
        cookies: cookiesData,
        resourceLogs: resources,
        ...memoryInfo
      }));
    };

    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
