/** *****************************************************************************
 * Copyright 2023 EMBL - European Bioinformatics Institute
 *
 * Licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the
 * License.
 ****************************************************************************** */

import { type Response } from 'express';
import { AppError } from './AppError';
import { StatusCodes } from 'http-status-codes';

class ErrorHandler {
  private isTrustedError (error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }

    return false;
  }

  private handleTrustedError (error: AppError, response: Response): void {
    response.status(error.httpCode).json({ name: error.name, message: error.message });
  }

  private handleCriticalError(error: Error | AppError, response?: Response): void {
    if (response != null) {
      response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ name: 'Internal server error', message: 'Application will shut down. Please inform the admin team.', details: error.message });
    }

    console.log('Application encountered a critical error. Exiting');
    process.exit(1);
  }

  public handleError (error: Error | AppError, response?: Response): void {
    if (this.isTrustedError(error) && (response != null)) {
      this.handleTrustedError(error as AppError, response);
    } else {
      this.handleCriticalError(error, response);
    }
  }
}

export const errorHandler = new ErrorHandler();
