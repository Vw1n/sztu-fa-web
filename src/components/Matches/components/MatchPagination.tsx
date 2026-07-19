import React from 'react';

interface MatchPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const MatchPagination: React.FC<MatchPaginationProps> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="paginationButton">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
    </button>
    <div className="paginationNumbers">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button key={page} onClick={() => onPageChange(page)} className={`paginationNumber ${currentPage === page ? 'active' : ''}`}>
          {page}
        </button>
      ))}
    </div>
    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="paginationButton">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  </div>
);
