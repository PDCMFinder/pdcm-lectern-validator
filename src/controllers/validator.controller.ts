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
import { RequestExeption } from '@/exceptions/request.exception';
import { ConfigurationException } from '@/exceptions/configuration.exception';
import getLogger from '@/lib/logger';

const logger = getLogger('VALIDATOR_CONTROLLER');
const validatorService = new ValidatorService();

/**
 * Reads the content of an Excel file from the request and validates its content against a
 * JSON schema (a dictionary in Lectern).
 */
export const validateExcelData = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  try {
    const file: Express.Multer.File = validateFileInRequest(req);
    const validationReport = await validatorService.validateExcelFile(file);

    res.status(201).send(validationReport);
  } catch (error) {
    if (error instanceof RequestExeption) {
      logger.error('RequestExeption:', error.message);
      res.status(error.statusCode).send(error.message);
    } else if (error instanceof ConfigurationException) {
      logger.error('ConfigurationException:', error.message);
      res.status(500).send(error.message);
    } else if (error instanceof Error) {
      logger.error('Error:', error.message);
      res.status(500).send(error.message);
    } else {
      logger.error(error);
      res.status(500).send('Server error');
    }
  }
});
