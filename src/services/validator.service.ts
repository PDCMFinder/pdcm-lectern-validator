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
  functions as lecternSchemaFunctions,
} from '@overturebio-stack/lectern-client';

import FileProcessor from '../utils/fileProcessor'
import * as dictionaryService from '../services/dictionary.service';

import { getLogger } from '@/utils/loggers';

const logger = getLogger('VALIDATOR_SERVICE');
const fileProcessor = new FileProcessor();

class ValidatorService {

  constructor() { }

 /**
  * Reads the content of an Excel file from the request and validates its content against a 
  * JSON schema (a dictionary in Lectern).
  */
  public async validateExcelFile(req: any): Promise<any> {
    logger.info('Validating excel file');
    const results: Map<string, any> = new Map();
    const resultMap: Map<string, any> = await fileProcessor.processExcelFile(req);
    resultMap.forEach((value, key) => {
      logger.info("About to validate data from file:", key);
      // const schemaName = this.getSchemaNameFromFileName(key);
      const schemaName = key;
      console.log('schemaName', schemaName);


      let records: any[] = []
      value.forEach((element: any) => {
        records.push(element);
      });

      let dictionary = dictionaryService.instance().getLatestVersionDictionaty();

      const validationResults = lecternSchemaFunctions.processRecords(dictionary, schemaName, records);
      results.set(schemaName, validationResults.validationErrors);
    })

    return Promise.resolve(results);
  }

  getSchemaNameFromFileName(fileName: string): string {
    const idx = fileName.indexOf('.');
    return fileName.slice(0, idx);
  }

}

export default ValidatorService;

