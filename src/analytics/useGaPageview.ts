// src/analytics/useGaPageview.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useGaPageview(measurementId = 'G-9Y26DXLPQM') {
  const location = useLocation();
  useEffect(() => {
    // Garante que gtag existe
    if (!(window as any).gtag) return;

    // GA4 – maneira recomendada
    (window as any).gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: location.pathname + location.search,
      send_to: measurementId,
    });
  }, [location]);
}
