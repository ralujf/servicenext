import { useCallback, useState, useEffect } from 'react';
import { usePageMetadata, PageMetadata, pageMetadata } from './usePageMetadata';

export type PageView = 'home' | 'practice' | 'progress' | 'resources' | 'auth' | 'question';

export function usePageView(initialView: PageView = 'practice') {
  const [currentView, setCurrentView] = useState<PageView>(initialView);
  const [currentMetadata, setCurrentMetadata] = useState<PageMetadata>(pageMetadata.practice);

  // Use the metadata hook
  usePageMetadata(currentMetadata);

  const navigateToView = useCallback((view: PageView, additionalData?: any) => {
    let metadata: PageMetadata;

    switch (view) {
      case 'home':
        metadata = pageMetadata.home;
        break;
      case 'practice':
        metadata = pageMetadata.practice;
        break;
      case 'progress':
        metadata = pageMetadata.progress;
        break;
      case 'resources':
        metadata = pageMetadata.resources;
        break;
      case 'auth':
        metadata = pageMetadata.auth;
        break;
      case 'question':
        const questionTitle = additionalData?.title || 'Coding Challenge';
        metadata = pageMetadata.question(questionTitle);
        break;
      default:
        metadata = pageMetadata.practice;
    }

    // Add canonical URL based on current location
    if (typeof window !== 'undefined') {
      metadata.canonical = window.location.origin + window.location.pathname;
    }

    setCurrentView(view);
    setCurrentMetadata(metadata);
    
    return metadata;
  }, []);

  // Method to update metadata for the current view with custom data
  const updateCurrentMetadata = useCallback((updates: Partial<PageMetadata>) => {
    setCurrentMetadata(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return {
    currentView,
    navigateToView,
    updateCurrentMetadata,
  };
}
