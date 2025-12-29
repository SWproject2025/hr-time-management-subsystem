'use client';

import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, LayoutList } from 'lucide-react';
import recruitmentService, { Document } from '@/lib/recruitmentService';
import {
  LoadingSpinner,
  EmptyState,
  showSuccessToast,
  showErrorToast,
  ConfirmDialog,
} from '@/components/recruitment-shared';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentFilterPanel } from '@/components/documents/DocumentFilterPanel';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';

type ViewMode = 'grid' | 'list';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    ownerId: '',
    applicationId: '',
    type: '',
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recruitmentService.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to load documents');
      showErrorToast('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    // Apply filters
    if (filters.ownerId) {
      filtered = filtered.filter((d) => d.ownerId === filters.ownerId);
    }
    if (filters.applicationId) {
      filtered = filtered.filter((d) => d.applicationId === filters.applicationId);
    }
    if (filters.type) {
      filtered = filtered.filter((d) => d.type === filters.type);
    }

    // Apply search (search in filename/path)
    if (searchTerm) {
      filtered = filtered.filter((d) =>
        d.filePath.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      ownerId: '',
      applicationId: '',
      type: '',
    });
    setSearchTerm('');
  };

  const handleUpload = async (data: {
    type: string;
    filePath: string;
    ownerId?: string;
    applicationId?: string;
  }) => {
    try {
      await recruitmentService.uploadDocument(data as any);
      showSuccessToast('Document uploaded successfully');
      setShowUploadModal(false);
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      showErrorToast(error.message || 'Failed to upload document');
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await recruitmentService.deleteDocument(documentToDelete._id);
      showSuccessToast('Document deleted successfully');
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      showErrorToast(error.message || 'Failed to delete document');
    }
  };

  const handleView = (doc: Document) => {
    // TODO: Implement document viewing/download
    showErrorToast('Document viewing coming soon');
  };

  const handleDownload = (doc: Document) => {
    // TODO: Implement document download
    showErrorToast('Document download coming soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading documents..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchDocuments}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage recruitment documents and files
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="List view"
              >
                <LayoutList className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <DocumentFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Documents List/Grid */}
        {filteredDocuments.length === 0 ? (
          <EmptyState
            title="No documents found"
            message={
              searchTerm || filters.ownerId || filters.applicationId || filters.type
                ? 'Try adjusting your search or filters'
                : 'Get started by uploading your first document'
            }
            actionButton={
              !searchTerm && !filters.ownerId && !filters.applicationId && !filters.type ? (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upload First Document
                </button>
              ) : undefined
            }
          />
        ) : (
          <DocumentsList
            documents={filteredDocuments}
            viewMode={viewMode}
            onView={handleView}
            onDownload={handleDownload}
            onDelete={(doc) => setDocumentToDelete(doc)}
          />
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.filePath}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
