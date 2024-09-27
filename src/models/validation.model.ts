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

export enum ValidationResultStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  NOT_PROCESSED = 'not_processed',
}

export interface ProcessedFile {
  fileName: string
  data: Map<string, SheetData>
}

export interface SheetData {
  rows: any,
  lineNumberOffset: number
}

export interface PDCMSchemaValidationError {
  readonly errorType: string
  readonly index: number
  readonly fieldName: string
  readonly info: Record<string, any>
  readonly message: string
}

export interface SheetValidationResult {
  sheetName: string
  status?: ValidationResultStatus
  result?: PDCMSchemaValidationError[]
}

export interface ValidationReport {
  date: Date
  fileName: string
  status: ValidationResultStatus
  dictionaryName: string
  dictionaryVersion: string
  sheetsValidationResults: SheetValidationResult[]
}

export interface RowData {
  [key: string]: any;
  // Add other properties that row might have
}
