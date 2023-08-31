import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError';

/**
 * Bad request error. Examples:
 * - Excel file is not present.
 * - Excel file doesn't have the expected structure (for instance extra sheets).
 *
 * This type of error is operational, so it doesn't make the application shut down.
 */
export class BadRequestApiError extends AppError {
  constructor (description: string, httpCode = StatusCodes.BAD_REQUEST) {
    super({ name: 'Bad request error', httpCode, description, isOperational: true });
  }
}
