import { PaginatedResponse } from "../types";

// 페이지네이션 유틸리티
export const paginate = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 페이지네이션 파라미터 파싱
export const parsePaginationParams = (query: {
  page?: string;
  limit?: string;
}): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
