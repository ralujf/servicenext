import { useEffect } from 'react';

export interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export function usePageMetadata(metadata: PageMetadata) {
  useEffect(() => {
    // Update document title
    const baseTitle = 'ServiceNext';
    document.title = metadata.title ? `${metadata.title} | ${baseTitle}` : baseTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Update description
    if (metadata.description) {
      updateMetaTag('description', metadata.description);
    }

    // Update keywords
    if (metadata.keywords) {
      updateMetaTag('keywords', metadata.keywords);
    }

    // Update Open Graph tags
    if (metadata.ogTitle) {
      updateMetaTag('og:title', metadata.ogTitle, true);
    }

    if (metadata.ogDescription) {
      updateMetaTag('og:description', metadata.ogDescription, true);
    }

    if (metadata.ogImage) {
      updateMetaTag('og:image', metadata.ogImage, true);
    }

    // Update canonical URL
    if (metadata.canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      
      if (linkElement) {
        linkElement.href = metadata.canonical;
      } else {
        linkElement = document.createElement('link');
        linkElement.rel = 'canonical';
        linkElement.href = metadata.canonical;
        document.head.appendChild(linkElement);
      }
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = baseTitle;
    };
  }, [metadata]);
}

// Predefined metadata for common pages
export const pageMetadata = {
  home: {
    title: 'Home',
    description: 'Master ServiceNow development with interactive coding challenges and real-world scenarios.',
    keywords: 'ServiceNow, coding, challenges, development, practice, learning',
    ogTitle: 'ServiceNext - ServiceNow Coding Practice',
    ogDescription: 'Master ServiceNow development with interactive coding challenges and real-world scenarios.',
  },
  practice: {
    title: 'Practice',
    description: 'Solve ServiceNow coding challenges to improve your development skills.',
    keywords: 'ServiceNow practice, coding challenges, GlideRecord, Script Include, Business Rules',
    ogTitle: 'Practice - ServiceNext',
    ogDescription: 'Solve ServiceNow coding challenges to improve your development skills.',
  },
  progress: {
    title: 'Progress',
    description: 'Track your learning progress and coding achievements.',
    keywords: 'progress tracking, learning analytics, ServiceNow skills',
    ogTitle: 'Progress - ServiceNext',
    ogDescription: 'Track your learning progress and coding achievements.',
  },
  resources: {
    title: 'Resources',
    description: 'Explore helpful resources, documentation, and learning materials for ServiceNow development.',
    keywords: 'ServiceNow resources, documentation, learning materials, guides',
    ogTitle: 'Resources - ServiceNext',
    ogDescription: 'Explore helpful resources, documentation, and learning materials for ServiceNow development.',
  },
  auth: {
    title: 'Sign In',
    description: 'Sign in to track your progress and access personalized features.',
    keywords: 'sign in, login, authentication, account',
    ogTitle: 'Sign In - ServiceNext',
    ogDescription: 'Sign in to track your progress and access personalized features.',
  },
  question: (questionTitle: string) => ({
    title: questionTitle,
    description: `Solve the ServiceNow coding challenge: ${questionTitle}`,
    keywords: 'ServiceNow challenge, coding problem, practice, development',
    ogTitle: `${questionTitle} - ServiceNext`,
    ogDescription: `Solve the ServiceNow coding challenge: ${questionTitle}`,
  }),
} as const;
