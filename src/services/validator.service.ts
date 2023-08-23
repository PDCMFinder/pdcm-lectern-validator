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
} from '@overturebio-stack/lectern-client';

import { type FieldDefinition, type SchemasDictionary } from '@overturebio-stack/lectern-client/lib/schema-entities';
import FileProcessor from '../utils/fileProcessor';
import * as dictionaryService from './dictionary.service';
import {
  type ProcessedFile, type SheetValidationResult, type ValidationReport, ValidationResultStatus, type PDCMSchemaValidationError
} from '@/models/validation.model';
import { ConfigurationException } from '@/exceptions/configuration.exception';
import { BadRequestException } from '@/exceptions/bad-request.exception';
import { difference } from 'lodash';
import getLogger from '@/lib/logger';

const logger = getLogger('VALIDATOR_SERVICE');
const fileProcessor = new FileProcessor();

const errorTypeMapping = new Map<string, string>([
  ['MISSING_REQUIRED_FIELD', 'Missing required field'],
  ['INVALID_BY_REGEX', 'Invalid format'],
  ['INVALID_ENUM_VALUE', 'Value error'],
  ['UNRECOGNIZED_FIELD', 'Unrecognized field']
]);

const errorTextMapping = new Map<string, string>([
  ['MISSING_REQUIRED_FIELD', 'A required field is missing from the input data.'],
  ['INVALID_BY_REGEX', 'The field\'s value does not comply with the defined regular expression pattern.'],
  ['INVALID_ENUM_VALUE', 'The provided value/data does not match any of the allowed values.'],
  ['UNRECOGNIZED_FIELD', 'The submitted data has a field which is not in the schema.']
]);

class ValidatorService {
  /**
   * Reads the content of an Excel file from the request and validates its content against a
   * JSON schema (a dictionary in Lectern).
   */
  public async validateExcelFile (file: Express.Multer.File): Promise<ValidationReport> {
    logger.info(`Validating excel file ${file.originalname}`);
    const sheetsValidationResults: SheetValidationResult[] = [];

    // Get an object with all the data from the Excel file
    const processedFile: ProcessedFile = await fileProcessor.processExcelFile(file);

    // Get the dictionary to use in the validations. Fetched from the Lectern instance.
    const validationDictionary = dictionaryService.instance().getLatestVersionDictionary();
    if (validationDictionary == null) {
      logger.error('No validation dictionary found');
      throw new ConfigurationException('File could not be validated because a suitable dictionary to validate against was not found.');
    }

    this.#validateSchemasAndSheetsMatch(validationDictionary, processedFile);

    processedFile.data.forEach((value, key) => {
      const sheetValidationResult: SheetValidationResult = this.#processSheet(key, value, validationDictionary);
      sheetsValidationResults.push(sheetValidationResult);
    });

    const validationReport: ValidationReport = this.#buildReport(processedFile.fileName, validationDictionary.name, validationDictionary.version, sheetsValidationResults);

    return await Promise.resolve(validationReport);
  }

  #processSheet (schemaName: string, records: Map<string, any>, dictionary: SchemasDictionary): SheetValidationResult {
    const sheetValidationResult: SheetValidationResult = {
      sheetName: schemaName
    };

    const sheetRows: any[] = [...records.values()];

    try {
      // Call the lectern validator
      const validationResults = lecternSchemaFunctions.processRecords(dictionary, schemaName, sheetRows);

      const sheetValidationStatus = validationResults.validationErrors.length > 0
        ? ValidationResultStatus.INVALID
        : ValidationResultStatus.VALID;

      // SchemaValidationError is read only so we need to copy data to a structure without those restrictions
      const validationErrors: PDCMSchemaValidationError[] = validationResults.validationErrors.map((x: any) =>
        this.#transformLecternError(x, dictionary, schemaName, x.fieldName)
      // ({
      //   errorType: this.#getMappedErrorType(x.errorType),
      //   index: x.index,
      //   fieldName: x.fieldName,
      //   info: x.info,
      //   message: this.#getMappedErrorText(x.errorType)
      // })
      );

      sheetValidationResult.status = sheetValidationStatus;
      sheetValidationResult.result = validationErrors;
    } catch (error) {
      throw new BadRequestException(error as string);
    }

    return sheetValidationResult;
  }

  getSchemaNameFromFileName (fileName: string): string {
    const idx = fileName.indexOf('.');
    return fileName.slice(0, idx);
  }

  #buildReport (
    fileName: string,
    dictionaryName: string,
    dictionaryVersion: string,
    sheetsValidationResults: SheetValidationResult[]
  ): ValidationReport {
    const reportStatus = this.#getUnifiedStatus(sheetsValidationResults);

    const validationReport: ValidationReport = {
      date: new Date(),
      fileName,
      status: reportStatus,
      dictionaryName,
      dictionaryVersion,
      sheetsValidationResults
    };

    return validationReport;
  }

  #getUnifiedStatus (sheetsValidationResults: SheetValidationResult[]): ValidationResultStatus {
    const anyInvalid: boolean = sheetsValidationResults
      .some((x) => x.status !== ValidationResultStatus.VALID);
    return anyInvalid ? ValidationResultStatus.INVALID : ValidationResultStatus.VALID;
  }

  #validateSchemasAndSheetsMatch (dictionary: SchemasDictionary, processedFile: ProcessedFile): void {
    const schemas = dictionary.schemas.map(e => e.name);
    const sheets = Array.from(processedFile.data.keys());
    // const missingSchemas = difference(schemas, sheets);
    // if (missingSchemas.length > 0 ) {
    //   throw new BadRequestException(`Schemas: [${missingSchemas.join(', ')}] not found in the Excel file`);
    // }
    const missingSheets = difference(sheets, schemas);
    if (missingSheets.length > 0) {
      throw new BadRequestException(`Sheets: [${missingSheets.join(', ')}] not found in the dictionary`);
    }
  }

  // Transform Lectern Error types into customized error types for PDCM
  #getMappedErrorType (errorType: string): string {
    return errorTypeMapping.get(errorType) ?? errorType;
  }

  // Transform Lectern Error text into customized error types for PDCM
  #getMappedErrorText (errorType: string): string {
    return errorTextMapping.get(errorType) ?? errorType;
  }

  #getExtendedInfo (originalError: any, dictionary: SchemasDictionary, schemaName: string, fieldName: string): Record<string, any> {
    const extendedInfo = { ...originalError.info };
    if (originalError.errorType !== 'UNRECOGNIZED_FIELD') {
      const fieldDefinition: FieldDefinition = dictionaryService.getFieldDefinition(dictionary, schemaName, fieldName);
      // Needs to be defined as any because format is not part of the meta definition
      const meta: any = fieldDefinition.meta;
      if (meta !== undefined) {
        const format = meta.format;
        extendedInfo.format = format;
      }
    }
    return extendedInfo;
  }

  #transformLecternError (originalError: any, dictionary: SchemasDictionary, schemaName: string, fieldName: string): PDCMSchemaValidationError {
    const newErrorType: string = this.#getMappedErrorType(originalError.errorType);
    const newInfo: Record<string, any> = this.#getExtendedInfo(originalError, dictionary, schemaName, fieldName);
    const newMessage: string = this.#getMappedErrorText(originalError.errorType);

    const pdcmError: PDCMSchemaValidationError = {
      errorType: newErrorType,
      index: originalError.index,
      fieldName: originalError.fieldName,
      info: newInfo,
      message: newMessage
    };
    return pdcmError;
  }
}

export default ValidatorService;
