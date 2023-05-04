/*******************************************************************************
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
 *******************************************************************************/

const asyncHandler = require('express-async-handler')

import { NextFunction, Response } from "express";
import ValidatorService from '../services/validator.service'

const validatorService = new ValidatorService();

/**
 * Reads the content of an Excel file from the request and validates its content against a 
 * JSON schema (a dictionary in Lectern).
 */
export const validateExcelData = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  try {
    const validationErrors = await validatorService.validateExcelFile(req);
    res.status(201).send(Object.fromEntries(validationErrors));
  } catch (error) {
    console.error(error);
    res.status(500).send('error');
  }
});
