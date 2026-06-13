'use client'

import { useMemo, useState } from 'react'

export function useClientPagination<T>(data: T[], pageSize = 20) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  const resetPage = () => setPage(1)

  return { page, setPage, totalPages, pageData, resetPage }
}
