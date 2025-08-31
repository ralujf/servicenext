import React from 'react';
import { ExternalLink, Play, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ResourceCard {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ElementType;
  category: string;
}

const resources: ResourceCard[] = [
  {
    id: 'javascript-playlist',
    title: 'JavaScript Fundamentals',
    description: 'Comprehensive JavaScript tutorial playlist covering core concepts, functions, objects, and modern ES6+ features essential for ServiceNow development.',
    url: 'https://youtube.com/playlist?list=PL3rNcyAiDYK2_87aRvXEmAyD8M9DARVGK&feature=shared',
    icon: Play,
    category: 'Programming'
  },
  {
    id: 'rdbms-tutorial',
    title: 'RDBMS & Database Concepts',
    description: 'Learn relational database management system concepts, SQL queries, and database design principles crucial for ServiceNow platform development.',
    url: 'https://www.youtube.com/watch?v=aQQL6W_FMy0',
    icon: Database,
    category: 'Database'
  }
];

export function Resources() {
  const handleCardClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
          Learning Resources
        </h1>
        <p className="text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
          Curated external resources to help you master the fundamentals needed for ServiceNow development
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const Icon = resource.icon;
          
          return (
            <Card 
              key={resource.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 group"
              onClick={() => handleCardClick(resource.url)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors" style={{ fontFamily: 'Chivo, sans-serif' }}>
                        {resource.title}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground mt-1 font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                        {resource.category}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  {resource.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}