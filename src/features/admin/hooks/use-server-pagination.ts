export interface PaginationState {
  page: number
  pageSize: number
}

export function getPaginationParams(searchParams: {
  page?: string
  pageSize?: string
}): PaginationState {
  return {
    page: Math.max(1, parseInt(searchParams.page || '1', 10) || 1),
    pageSize: Math.min(
      100,
      Math.max(1, parseInt(searchParams.pageSize || '20', 10) || 20),
    ),
  }
}

export function getPaginationRange(
  total: number,
  page: number,
  pageSize: number,
) {
  const totalPages = Math.ceil(total / pageSize)
  const from = (page - 1) * pageSize
  const to = Math.min(from + pageSize, total)
  return { totalPages, from, to, total }
}
