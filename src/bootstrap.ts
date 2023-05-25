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

import { getLogger } from '@/utils/loggers'
import * as dictionaryService from './services/dictionary.service'
import { type AppConfig } from './config'

const logger = getLogger('BOOTSTRAP')

export const run = async (config: AppConfig): Promise<void> => {
  await initValidationDictionary(config)
}

/**
 * Fetches the Lectern dictionary to be used in the validations. The name and the version of the dictionary
 * are set up as arguments when starting the application and can be found in the conf object
 */
const initValidationDictionary = async (config: AppConfig): Promise<void> => {
  const dictionaryName = config.dictionaryName()
  const dictionaryVersion = config.dictionaryVersion()
  const dictionaryServiceUrl = config.dictionaryServiceUrl()

  try {
    dictionaryService.create(dictionaryServiceUrl)
    await dictionaryService.instance().loadValidationDictionary(dictionaryName, dictionaryVersion)
  } catch (err) {
    logger.error(err)
  }
}
