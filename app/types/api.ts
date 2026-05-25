export interface BackendError {
  code: 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID_INPUT' | 'INTERNAL' | 'UNAUTHORIZED';
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ActionResponse {
  success: boolean;
  error?: string;
}