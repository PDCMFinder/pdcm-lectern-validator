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

import { type ProcessedFile } from '@/models/validation.model'
import { getLogger } from '@/utils/loggers'
import XLSX from 'xlsx'

const logger = getLogger('fileProcessor')

class FileProcessor {
  /**
     * Read one Excel file from the request. Transforms the data in a suitable format to be validated.
     * @param req Request that holds the Excel to process
     * @returns A ProcessedFile object with the sheets and rows as a dictionary.
     */
  public async processExcelFile (file: Express.Multer.File): Promise<ProcessedFile> {
    const resultMap = new Map<string, any>()
    const opts = { raw: false }

    const wb = XLSX.readFile(file.path)
    const sheets = wb.SheetNames
    logger.info('Sheets:', sheets)
    sheets.forEach((sheet: any) => {
      const data = XLSX.utils.sheet_to_json(wb.Sheets[sheet], opts)
      const dataWithoutComments = removeComments(data)
      resultMap.set(sheet, dataWithoutComments)
    })

    const processedFile: ProcessedFile = {
      fileName: file.originalname,
      data: resultMap
    }

    return await Promise.resolve(processedFile)
  }
}

const removeComments = (data: any[]): any[] => {
  return data.filter(record => !(shouldIgnoreRecord(record)))
}

const shouldIgnoreRecord = (record: any): boolean => {
  if ('Field' in record) {
    const valueAsString = record.Field as string
    return valueAsString.startsWith('#')
  }
  return false
}

export default FileProcessor
