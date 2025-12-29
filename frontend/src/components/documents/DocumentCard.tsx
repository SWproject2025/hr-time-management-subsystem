import React from 'react';
import { Eye, Download, Trash2 } from 'lucide-react';
import { Document } from '@/lib/recruitmentService';
import { DocumentTypeIcon } from './DocumentTypeIcon';
import { cn } from '@/lib/calc-draft-utils';

interface DocumentCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
}

export function DocumentCard({
  document,
  viewMode,
  onView,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  if (viewMode === 'grid') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        {/* Icon Header */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center">
          <DocumentTypeIcon type={document.type} className="h-16 w-16" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 truncate mb-2" title={getFileName(document.filePath)}>
            {getFileName(document.filePath)}
          </h3>

          <div className="space-y-1 text-xs text-gray-600 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Type:</span>
              <span className="font-medium uppercase">{document.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Uploaded:</span>
              <span>{formatDate(document.uploadedAt)}</span>
            </div>
            {document.ownerId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Owner:</span>
                <span className="font-mono">{document.ownerId.substring(0, 8)}...</span>
              </div>
            )}
            {document.applicationId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Application:</span>
                <span className="font-mono">{document.applicationId.substring(0, 8)}...</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(document)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </button>
            <button
              onClick={() => onDownload(document)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              onClick={() => onDelete(document)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <DocumentTypeIcon type={document.type} className="h-10 w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
            {getFileName(document.filePath)}
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="uppercase font-medium">{document.type}</span>
            <span>Uploaded {formatDate(document.uploadedAt)}</span>
            {document.ownerId && (
              <span className="font-mono">Owner: {document.ownerId.substring(0, 8)}...</span>
            )}
            {document.applicationId && (
              <span className="font-mono">App: {document.applicationId.substring(0, 8)}...</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onView(document)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View document"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDownload(document)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Download document"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(document)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
