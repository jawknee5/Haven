import { Request, Response, NextFunction } from 'express';

// ============================================
// ERROR TYPES
// ============================================

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN_ERROR');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Not Found') {
    super(404, message, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(409, message, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = 'Internal Server Error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ERROR]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Record not found',
      });
    }
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_ENTRY',
        message: 'Unique constraint violation',
      });
    }
  }

  // Default error response
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
};

// ============================================
// ASYNC WRAPPER
// ============================================

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// VALIDATION HELPERS
// ============================================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
