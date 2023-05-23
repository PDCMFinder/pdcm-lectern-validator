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

import {
  functions as lecternSchemaFunctions
} from '@overturebio-stack/lectern-client'

import { type SchemasDictionary } from '@overturebio-stack/lectern-client/lib/schema-entities'
import FileProcessor from '../utils/fileProcessor'
import * as dictionaryService from './dictionary.service'

import { getLogger } from '@/utils/loggers'
import {
  type ProcessedFile, type SheetValidationResult, type ValidationReport, ValidationResultStatus
} from '@/models/validation.model'

const logger = getLogger('VALIDATOR_SERVICE')
const fileProcessor = new FileProcessor()

class ValidatorService {
  /**
   * Reads the content of an Excel file from the request and validates its content against a
   * JSON schema (a dictionary in Lectern).
   */
  public async validateExcelFile (file: Express.Multer.File): Promise<ValidationReport> {
    logger.info('Validating excel file')
    const sheetsValidationResults: SheetValidationResult[] = []

    // Get an object with all the data from the Excel file
    const processedFile: ProcessedFile = await fileProcessor.processExcelFile(file)

    // Get the dictionary to use in the validations. Fetched from the Lectern instance.
    const validationDictionary = dictionaryService.instance().getLatestVersionDictionary()

    processedFile.data.forEach((value, key) => {
      const sheetValidationResult: SheetValidationResult = this.#processSheet(key, value, validationDictionary)
      sheetsValidationResults.push(sheetValidationResult)
    })

    const validationReport: ValidationReport = this.#buildReport(processedFile.fileName, validationDictionary.name, validationDictionary.version, sheetsValidationResults)

    return await Promise.resolve(validationReport)
  }

  #processSheet (sheetName: string, records: Map<string, any>, dictionary: SchemasDictionary): SheetValidationResult {
    // For now the schema is the plain sheet name, but this will change later when working with examples where
    // some cleaning in the name will be needed
    const schemaName = sheetName

    const sheetRows: any[] = [...records.values()]

    // Call the lectern validator
    const validationResults = lecternSchemaFunctions.processRecords(dictionary, schemaName, sheetRows)

    const sheetValidationStatus = validationResults.validationErrors.length > 0
      ? ValidationResultStatus.INVALID
      : ValidationResultStatus.VALID

    const sheetValidationResult: SheetValidationResult = {
      sheetName,
      schema: schemaName,
      status: sheetValidationStatus,
      result: validationResults.validationErrors
    }

    return sheetValidationResult
  }

  getSchemaNameFromFileName (fileName: string): string {
    const idx = fileName.indexOf('.')
    return fileName.slice(0, idx)
  }

  #buildReport (
    fileName: string,
    dictionaryName: string,
    dictionaryVersion: string,
    sheetsValidationResults: SheetValidationResult[]
  ): ValidationReport {
    const reportStatus = this.#getUnifiedStatus(sheetsValidationResults)

    const validationReport: ValidationReport = {
      date: new Date(),
      fileName,
      status: reportStatus,
      dictionaryName,
      dictionaryVersion,
      sheetsValidationResults
    }

    return validationReport
  }

  #getUnifiedStatus (sheetsValidationResults: SheetValidationResult[]): ValidationResultStatus {
    const anyInvalid: boolean = sheetsValidationResults
      .some((x) => x.status !== ValidationResultStatus.VALID)
    return anyInvalid ? ValidationResultStatus.INVALID : ValidationResultStatus.VALID
  }
}

export default ValidatorService
