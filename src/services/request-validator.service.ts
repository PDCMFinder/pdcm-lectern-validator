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

import { type Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestException } from '@/exceptions/bad-request.exception';

const AcceptedFormats = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'];

const validateFileExists = (file: Express.Multer.File | undefined): void => {
  if (file == null) {
    throw new BadRequestException('No file uploaded');
  }
};

const validateFileType = (file: Express.Multer.File | undefined): void => {
  const mimetype = file?.mimetype ?? 'none';
  if (!AcceptedFormats.includes(mimetype)) {
    throw new BadRequestException(
      `Please upload an Excel file. Expected: ${AcceptedFormats.join(',')}. Obtained: ${mimetype}.`,
      StatusCodes.UNSUPPORTED_MEDIA_TYPE
    );
  }
};

export const validateFileInRequest = (request: Request): Express.Multer.File => {
  validateFileExists(request.file);
  validateFileType(request.file);
  return request.file as Express.Multer.File;
};
