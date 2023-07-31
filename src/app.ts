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

import createError from 'http-errors'

import express, { type RequestHandler, type ErrorRequestHandler } from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import indexRouter from './routes/index'
import validatorRouter from './routes/validator'
import dictionaryRouter from './routes/dictionary'

class App {
  public app: express.Application

  constructor () {
    this.app = express()
    this.config()
    this.routerSetup()
    this.errorHandler()
  }

  private config (): void {
    // view engine setup
    this.app.set('views', path.join(__dirname, 'views'))
    this.app.set('view engine', 'pug')

    var cors = require('cors');
    this.app.use(cors());
    this.app.options('*', cors());

    this.app.use(logger('dev'))
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: false }))
    this.app.use(cookieParser())
    this.app.use(express.static(path.join(__dirname, 'public')))
  }

  private routerSetup (): void {
    this.app.use('/', indexRouter)
    this.app.use(['/dictionary', '*/dictionary'], dictionaryRouter)
    this.app.use(['/validation', '*/validation'], validatorRouter)
  }

  private errorHandler (): void {
    // catch 404 and forward to error handler
    const requestHandler: RequestHandler = function (_req, _res, next) {
      next(createError(404))
    }
    this.app.use(requestHandler)

    // error handler
    const errorRequestHandler: ErrorRequestHandler = function (
      err,
      req,
      res,
      _next
    ): void {
      // set locals, only providing error in development
      res.locals.message = err.message
      res.locals.error = req.app.get('env') === 'development' ? err : {}

      // render the error page
      res.status(err.status !== undefined ? err.status : 500)
      res.render('error')
    }
    this.app.use(errorRequestHandler)
  }
}

export default new App().app
