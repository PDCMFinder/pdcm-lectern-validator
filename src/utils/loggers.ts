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

import path from 'path';
import log4js, { configure } from 'log4js';

export { getLogger } from 'log4js';

export function bootstrapLogger (): void {
  const date = new Date();
  const strDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  configure({
    appenders: {
      out: { type: 'stdout' },
      app: { type: 'file', filename: path.join(__dirname, '..', 'logs', `${strDate}.log`) }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  });

  const logger = log4js.getLogger();
  logger.level = 'debug';
}
