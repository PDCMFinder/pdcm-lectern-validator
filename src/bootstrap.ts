
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

import { getLogger } from '@/utils/loggers';
import * as dictionaryService from './services/dictionary.service';
import { AppConfig } from './config';

const logger = getLogger('BOOTSTRAP');

export const run = async (config: AppConfig) => {
    logger.info("Initializing...")
    // setup dictionary service
  try {
    dictionaryService.create(config.schemaServiceUrl());
    await loadSchema(config.schemaName(), config.initialSchemaVersion());
  } catch (err) {
    logger.error('failed to load schema', err);
  }
}

export async function loadSchema(schemaName: string, initialVersion: string) {
    try {
      await dictionaryService.instance().loadSchemaByVersion(schemaName, initialVersion);
    } catch (err) {
        logger.error('failed to load the schema', err);
    }
  }