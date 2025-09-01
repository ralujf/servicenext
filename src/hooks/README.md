# Page Metadata and Title Management Hooks

This directory contains custom React hooks for managing page metadata and document titles in the ServiceNext application.

## Hooks Overview

### `usePageMetadata(metadata: PageMetadata)`

The core hook that updates the document title and meta tags based on the provided metadata object.

**Features:**
- Updates document title with base title format: `{pageTitle} | ServiceNext`
- Manages meta description, keywords, and Open Graph tags
- Handles canonical URLs
- Automatically cleans up on component unmount

**Usage:**
```tsx
import { usePageMetadata } from '../hooks/usePageMetadata';

function MyComponent() {
  usePageMetadata({
    title: 'Practice Questions',
    description: 'Solve ServiceNow coding challenges',
    keywords: 'ServiceNow, coding, practice',
    ogTitle: 'Practice - ServiceNext',
    ogDescription: 'Solve ServiceNow coding challenges',
  });

  return <div>My Component</div>;
}
```

### `usePageView(initialView?: PageView)`

A higher-level hook that combines page navigation with automatic metadata updates.

**Features:**
- Manages current page view state
- Automatically updates metadata when navigating between views
- Provides predefined metadata for common pages
- Supports custom metadata updates

**Usage:**
```tsx
import { usePageView } from '../hooks/usePageView';

function App() {
  const { navigateToView, updateCurrentMetadata } = usePageView('practice');

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'practice':
        navigateToView('practice');
        break;
      case 'progress':
        navigateToView('progress');
        break;
      case 'resources':
        navigateToView('resources');
        break;
    }
  };

  const handleQuestionSelect = (question: Question) => {
    navigateToView('question', { title: question.title });
  };

  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

## Page Types

The following page types are supported with predefined metadata:

- `'home'` - Landing page
- `'practice'` - Question browser and coding challenges
- `'progress'` - User progress tracking
- `'resources'` - Learning resources and documentation
- `'auth'` - Sign in/authentication
- `'question'` - Individual question detail view

## Metadata Interface

```tsx
interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}
```

## Examples

### Basic Tab Navigation
```tsx
const { navigateToView } = usePageView();

const handleTabChange = (tab: string) => {
  navigateToView(tab as PageView);
};
```

### Question-Specific Metadata
```tsx
const handleQuestionSelect = (question: Question) => {
  navigateToView('question', { title: question.title });
};
```

### Custom Metadata Updates
```tsx
const { updateCurrentMetadata } = usePageView();

useEffect(() => {
  if (specialCondition) {
    updateCurrentMetadata({
      description: 'Updated description based on current state',
      keywords: 'dynamic, keywords, based, on, data',
    });
  }
}, [specialCondition]);
```

## Integration in Main App

The hooks have been integrated into the main App.tsx component:

1. **Tab Navigation**: Each tab change updates the page metadata
2. **Question Selection**: Selecting a question updates the title to include the question name
3. **Back Navigation**: Returning to the question list restores the practice page metadata

## SEO Benefits

These hooks provide several SEO and UX benefits:

- **Dynamic Titles**: Each page has a descriptive, unique title
- **Meta Descriptions**: Improved search result snippets
- **Open Graph Tags**: Better social media sharing
- **Canonical URLs**: Proper URL canonicalization
- **Keywords**: Targeted keywords for better search visibility

## Browser Tab Titles

The hooks ensure that browser tabs always show relevant, descriptive titles:

- `"Practice | ServiceNext"` - When browsing questions
- `"Array Manipulation Challenge | ServiceNext"` - When viewing a specific question
- `"Progress | ServiceNext"` - When viewing progress tracking
- `"Resources | ServiceNext"` - When viewing learning resources

This improves user experience when working with multiple tabs and makes it easier to identify the current page context.
