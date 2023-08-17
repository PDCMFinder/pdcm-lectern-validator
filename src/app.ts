/*
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
 */

import createError from 'http-errors';

import express, { type RequestHandler, type ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import indexRouter from './routes/index';
import validatorRouter from './routes/validator';
import dictionaryRouter from './routes/dictionary';
import { errorHandler } from './exceptions/ErrorHandler';
import getLogger from './lib/logger';

const log = getLogger('app');

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routerSetup();
    this.errorHandler();
  }

  private config(): void {
    // view engine setup
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'pug');

    this.app.use(cors());
    this.app.options('*', cors());

    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private routerSetup(): void {
    const baseUrl = process.env.BASE_URL ?? '';
    this.app.use(baseUrl + '/dictionary', dictionaryRouter);
    this.app.use(baseUrl + '/validation', validatorRouter);
    this.app.use(baseUrl + '/', indexRouter);
  }

  private errorHandler(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
      log.error(err.message || err)
      next(err);
    });

    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      errorHandler.handleError(err, res);
    });
  }

}

export default new App().app;
module.exports = new App().app;
