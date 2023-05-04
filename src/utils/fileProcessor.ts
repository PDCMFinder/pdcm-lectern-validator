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
const XLSX = require("xlsx"); 
import fs from "fs";

const logger = getLogger('fileProcessor');

class FileProcessor {

    /**
     * Read one Excel file from the request. Transforms the data in a suitable dictionary.
     * @param req Request that holds the Excel to process
     * @returns A dictionary where the key is the name of the tsv file and the value is a list
     * of dictionaries, where each one containing the records of each file.
     */
    public async processExcelFile(req: any): Promise<Map<string, any>> {
        const resultMap: Map<string, any> = new Map();
        logger.warn("processExcelFile >> req.file:", req.file)
        if (!req.file) {
            throw new Error("No file uploaded");
        }
        const opts = {raw: false};
       
        const wb = XLSX.readFile(req.file.path);
        const sheets = wb.SheetNames;
        console.log('Sheets:', sheets);
        sheets.forEach((sheet: any) => {
            const data = XLSX.utils.sheet_to_json(wb.Sheets[sheet], opts);
            resultMap.set(sheet, data);
        });

        return Promise.resolve(resultMap);
    }
}

export default FileProcessor;

