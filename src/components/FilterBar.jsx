import { useState } from 'react'

export default function FilterBar({
  filter, onFilter, search, onSearch,
  sortBy, onSort, filters, hasCompleted, onClearCompleted
}) {
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClearCompleted() {
    onClearCompleted()
    setConfirmClear(false)
  }

  return (
    <div className="filter-bar">
      <div className="filter-top">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="search"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="검색..."
            aria-label="할 일 검색"
          />
          {search && (
            <button className="search-clear" onClick={() => onSearch('')} aria-label="검색 지우기">
              ×
            </button>
          )}
        </div>

        <div className="sort-wrap">
          <label htmlFor="sort-select" className="sr-only">정렬 기준</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={e => onSort(e.target.value)}
          >
            <option value="createdAt">최신순</option>
            <option value="priority">우선순위순</option>
            <option value="dueDate">마감일순</option>
          </select>
        </div>
      </div>

      <div className="filter-bottom">
        <div className="filter-tabs" role="tablist" aria-label="필터">
          {[
            { key: filters.ALL, label: '전체' },
            { key: filters.ACTIVE, label: '진행 중' },
            { key: filters.COMPLETED, label: '완료' },
          ].map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={filter === tab.key}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => onFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {hasCompleted && (
          confirmClear ? (
            <div className="confirm-clear">
              <span className="confirm-msg">정말 삭제하시겠습니까?</span>
              <button className="btn-confirm-yes" onClick={handleClearCompleted}>삭제</button>
              <button className="btn-confirm-no" onClick={() => setConfirmClear(false)}>취소</button>
            </div>
          ) : (
            <button className="clear-btn" onClick={() => setConfirmClear(true)}>
              완료 항목 삭제
            </button>
          )
        )}
      </div>
    </div>
  )
}
