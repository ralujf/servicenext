import { usePageView } from '../hooks/usePageView';
import { usePageMetadata } from '../hooks/usePageMetadata';

// Example of using the metadata hooks in a component
export function ExamplePageComponent() {
  const { navigateToView, updateCurrentMetadata } = usePageView('practice');

  // Example of updating metadata when component mounts or data changes
  const handleQuestionLoad = (questionTitle: string) => {
    navigateToView('question', { title: questionTitle });
  };

  const handleCustomMetadata = () => {
    updateCurrentMetadata({
      title: 'Custom Page Title',
      description: 'Custom description for this specific view',
      keywords: 'custom, keywords, here',
    });
  };

  return (
    <div>
      <h1>Example Page Component</h1>
      <button onClick={() => navigateToView('practice')}>
        Go to Practice (updates metadata)
      </button>
      <button onClick={() => navigateToView('progress')}>
        Go to Progress (updates metadata)
      </button>
      <button onClick={() => handleQuestionLoad('Sample Question')}>
        Load Question (updates metadata with question title)
      </button>
      <button onClick={handleCustomMetadata}>
        Update Custom Metadata
      </button>
    </div>
  );
}

// Example of using the usePageMetadata hook directly
export function DirectMetadataExample() {
  usePageMetadata({
    title: 'Direct Metadata Example',
    description: 'This component sets metadata directly',
    keywords: 'example, metadata, direct',
    ogTitle: 'Direct Metadata - ServiceNext',
    ogDescription: 'Example of direct metadata usage',
  });

  return (
    <div>
      <h1>Direct Metadata Example</h1>
      <p>This component sets its metadata directly on mount.</p>
    </div>
  );
}
