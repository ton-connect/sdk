export interface Launch {
  id: number;
  name: string;
  closed: boolean;
  createdDate: string;
  updatedDate: string;
  status: string;
  description?: string;
}

export interface TestCase {
  id: number;
  name: string;
  status?: string;
  duration: number;
  startTime: string;
  endTime: string;
  description?: string;
  tags?: string[];
  testCaseId?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface LaunchFilters {
  projectId: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface TestCaseFilters {
  launchId: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}
