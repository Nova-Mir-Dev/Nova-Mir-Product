import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../in-app-notifications'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getNotifications', () => {
  it('returns notifications for a given user', async () => {
    const mockData = [{ id: '1', message: 'Test notification' }]

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({ data: mockData }),
          }),
        }),
      }),
      update: vi.fn(),
    })

    const result = await getNotifications('user-1')

    expect(result).toEqual(mockData)
  })

  it('returns empty array when data is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({ data: null }),
          }),
        }),
      }),
      update: vi.fn(),
    })

    const result = await getNotifications('user-1')

    expect(result).toEqual([])
  })

  it('queries notifications table with correct filters', async () => {
    const mockLimit = vi.fn().mockReturnValue({ data: [] })
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockReturnValue({
      select: mockSelect,
      update: vi.fn(),
    })

    await getNotifications('user-1')

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(mockLimit).toHaveBeenCalledWith(50)
  })
})

describe('markAsRead', () => {
  it('updates read_at and filters by id and user_id', async () => {
    const mockEq2 = vi.fn()
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 })

    mockFrom.mockReturnValue({
      select: vi.fn(),
      update: mockUpdate,
    })

    await markAsRead('user-1', 'notif-1')

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ read_at: expect.any(String) }),
    )
    expect(mockEq1).toHaveBeenCalledWith('id', 'notif-1')
    expect(mockEq2).toHaveBeenCalledWith('user_id', 'user-1')
  })
})

describe('markAllAsRead', () => {
  it('updates read_at and filters by user_id with null read_at', async () => {
    const mockIs = vi.fn()
    const mockEq = vi.fn().mockReturnValue({ is: mockIs })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockReturnValue({
      select: vi.fn(),
      update: mockUpdate,
    })

    await markAllAsRead('user-1')

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ read_at: expect.any(String) }),
    )
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(mockIs).toHaveBeenCalledWith('read_at', null)
  })
})
