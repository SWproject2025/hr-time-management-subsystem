import React from 'react';
import { Document } from '@/lib/recruitmentService';
import { DocumentCard } from './DocumentCard';

interface DocumentsListProps {
  documents: Document[];
  viewMode: 'grid' | 'list';
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
}

export function DocumentsList({
  documents,
  viewMode,
  onView,
  onDownload,
  onDelete,
}: DocumentsListProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            viewMode="grid"
            onView={onView}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc._id}
          document={doc}
          viewMode="list"
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
