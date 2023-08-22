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

import { type NextFunction, type Response } from 'express';
import ValidatorService from '../services/validator.service';
import { validateFileInRequest } from '@/services/request-validator.service';
import asyncHandler from 'express-async-handler';
import { ConfigurationException } from '@/exceptions/configuration.exception';
import { BadRequestException } from '@/exceptions/bad-request.exception';
import { AppError } from '@/exceptions/AppError';
import { BadRequestApiError } from '@/exceptions/bad-request-api-error';
import { ServerConfigurationAppError } from '@/exceptions/server-configuration-api-error';
import { StatusCodes } from 'http-status-codes';

const validatorService = new ValidatorService();

const handleApiError = (error: Error | AppError, res: Response): void => {
  if (error instanceof BadRequestException) {
    throw new BadRequestApiError(error.message, error.statusCode);
  } else if (error instanceof ConfigurationException) {
    throw new ServerConfigurationAppError(error.message);
  }
  else {
    throw error;
  }
}

/**
 * Reads the content of an Excel file from the request and validates its content against a
 * JSON schema (a dictionary in Lectern).
 */
export const validateExcelData = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  try {
    const file: Express.Multer.File = validateFileInRequest(req);
    const validationReport = await validatorService.validateExcelFile(file);

    res.status(StatusCodes.OK).send(validationReport);
  } catch (error: any) {
    handleApiError(error, req)
  }
});
