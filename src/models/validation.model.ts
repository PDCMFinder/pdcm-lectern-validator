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

import { type SchemaValidationError } from '@overturebio-stack/lectern-client/lib/schema-entities';

export enum ValidationResultStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  NOT_PROCESSED = 'not_processed',
}

export interface ProcessedFile {
  fileName: string
  data: Map<string, any>
}

export type MutableSchemaValidationError = {
  -readonly [Value in keyof SchemaValidationError]: SchemaValidationError[Value];
};

export interface SheetValidationResult {
  sheetName: string
  status?: ValidationResultStatus
  result?: MutableSchemaValidationError[]
}

export interface ValidationReport {
  date: Date
  fileName: string
  status: ValidationResultStatus
  dictionaryName: string
  dictionaryVersion: string
  sheetsValidationResults: SheetValidationResult[]
}
