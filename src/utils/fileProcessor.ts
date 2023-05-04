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
import csvParser from "csv-parser";
const XLSX = require("xlsx"); 
import fs from "fs";

const logger = getLogger('fileProcessor');

class FileProcessor {

    /**
     * Read one or mode TSVs from the request. Transforms the data in a suitable dictionary.
     * @param req Request that holds the TSVs to process
     * @returns A dictionary where the key is the name of the tsv file and the value is a list
     * of dictionaries, where each one containing the records of each file.
     */
    public async processFile(req: any): Promise<Map<string, any>> {
        const resultMap: Map<string, any> = new Map();

        if (!req.files) {
            throw new Error("No file uploaded");
        }

        // Create an array of promises that resolve when each file is parsed
        const promises: Promise<any>[] = req.files.map((file: any) => {
            return new Promise((resolve) => {
                const results: any[] = [];
                const rowsWithIdTuples: any[] = [];

                // Parse the TSV file using csv-parser
                const parser = csvParser({
                    separator: '\t',
                    mapHeaders: ({ header }) => header.toLowerCase(),

                });

                // Read the file stream and pipe it to the csv-parser
                const stream = fs.createReadStream(file.path).pipe(parser);

                // Push each row into the rows array
                let rowNumber = 1;
                stream.on('data', (row: any) => {
                    const rowWithId: [number, any] = [rowNumber++, row]
                    rowsWithIdTuples.push(rowWithId);
                });

                // Once the stream is finished, resolve the promise with the parsed data
                stream.on('end', () => {
                    console.log(`Parsed ${results.length} rows from file ${file.originalname}`);

                    const fileData = new Map<number, any>();
                    rowsWithIdTuples.forEach((tuple: any) => {
                        fileData.set(tuple[0], tuple[1]);
                    });

                    resultMap.set(file.originalname, fileData);

                    resolve([file.originalname, fileData]);
                });
            });
        });

        // Wait for all promises to resolve before sending the response
        return Promise.all(promises).then((data) => {
            const resultMap = new Map<string, any>(data);
            return Promise.resolve(resultMap);
        });
    }

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

