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

import {
  entities as dictionaryEntities,
  restClient as dictionaryRestClient,
} from '@overturebio-stack/lectern-client';

import { getLogger } from '@/utils/loggers';

const logger = getLogger('DICTIONARY_SERVICE');

let dictionaryService: DictionaryService;


class DictionaryService {
  private latestVersionDictionary: dictionaryEntities.SchemasDictionary = {
    schemas: [],
    name: '',
    version: '',
  };

  private validationDictionaryName: string = '';
  private validationDictionaryVersion: string = '';

  constructor(private schemaServiceUrl: string) { }

  /**
   * Fetches a specific dictionary from Lectern. This version will (usually the lastest) will be the one
   * to be used to validate excel files submited by the users.
   * @param name Name of the dictionary to use in the validations
   * @param version Version of the dictionary to use in the validations
   */
  loadValidationDictionary = async (
    name: string,
    version: string,
  ): Promise<dictionaryEntities.SchemasDictionary> => {
    try {
      logger.info(`Fetching dictionary to validations. Name: ${name} - Version: ${version}`);
      const newSchema = await dictionaryRestClient.fetchSchema(this.schemaServiceUrl, name, version);
      logger.info("Dictionary fetched successfully");
      this.latestVersionDictionary = newSchema;
      // Sets the version used for reference
      this.setValidationDictionaryInformation(name, version);
      return newSchema;
    } catch (err) {
      logger.error('Failed to fetch dictionary: ', err);
      throw new Error('Failed to fetch dictionary: ' + err);
    }
  }

  loadSchemaByVersion = async (
    name: string,
    version: string,
  ): Promise<dictionaryEntities.SchemasDictionary> => {
    try {
      const newSchema = await dictionaryRestClient.fetchSchema(
        this.schemaServiceUrl,
        name,
        version,
      );
      logger.info("Schema loaded...");
      logger.info(newSchema);
      this.latestVersionDictionary = newSchema;
      return newSchema;
    } catch (err) {
      logger.error('Failed to fetch schema: ', err);
      throw new Error('Failed to fetch schema: ' + err);
    }
  };

  setValidationDictionaryInformation(dictionaryName: string, dictionaryVersion: string) {
    this.validationDictionaryName = dictionaryName;
    this.validationDictionaryVersion = dictionaryVersion;
  }

  getLatestVersionDictionary() {
    return this.latestVersionDictionary;
  }

  getValidationDictionaryName() {
    return this.validationDictionaryName;
  }

  getValidationDictionaryVersion() {
    return this.validationDictionaryVersion;
  }

}

export function instance() {
  if (dictionaryService === undefined) {
    throw new Error('Validator Service not initialized, you should call create first');
  }
  return dictionaryService;
}

export function create(schemaServiceUrl: string) {
  logger.info("Creating service with url", schemaServiceUrl)
  dictionaryService = new DictionaryService(schemaServiceUrl);
}
