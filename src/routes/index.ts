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

import express, { NextFunction, Request, Response } from 'express';
import getLogger from "../lib/logger";
import { errorHandler } from '@/exceptions/ErrorHandler';

const router = express.Router();
const logger = getLogger('Index');

/* GET home page. */
router.get('/', (_req, res, _next) => {
  res.render('index', { title: 'PDCM validator using Lectern' });
});

// This section needs to be at the end. Used to handle exceptions

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // 1. Log the error or send it to a 3rd party error monitoring software
  logger.error(err.toString());

  next(err);
});

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Lastly, handle the error
  errorHandler.handleError(err, res);
});

export default router;
