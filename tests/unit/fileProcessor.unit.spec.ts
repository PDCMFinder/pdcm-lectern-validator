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

import FileProcessor from '../../src/utils/fileProcessor';
import XLSX from 'xlsx';
import { Readable } from 'stream';
import { ProcessedFile, SheetData } from '@/models/validation.model';

jest.mock('xlsx', () => ({
  readFile: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}))

const mockedXLSX = XLSX as jest.Mocked<typeof XLSX>;

describe('FileProcessor', () => {
  const mockFileName = 'test_file.xlsx';
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: mockFileName,
    encoding: '7bit',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    destination: '',
    filename: '',
    path: mockFileName,
    size: 1000,
    buffer: Buffer.from([]),
    stream: new Readable(),
  }

  it('should return empty if only commented values exist', async () => {
    const mockSheetNames = ['Sheet1'];
    const mockSheetData = [{ Field: '# Comment 1' }, { Field: '# Comment 2' }];

    // Mock XLSX.readFile
    mockedXLSX.readFile.mockReturnValue({ SheetNames: mockSheetNames, Sheets: { [mockSheetNames[0]]: {} } });

    // Mock XLSX.utils.sheet_to_json
    (mockedXLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockSheetData);

    const fileProcessor = new FileProcessor();

    // Call the method
    const result: ProcessedFile = await fileProcessor.processExcelFile(mockFile);

    const expectedData: Map<string, SheetData> = new Map([
      ['Sheet1',
        {
          lineNumberOffset: 4,
          rows: []
        }
      ]
    ]);

    // Assertions
    expect(result.fileName).toEqual(mockFileName);
    expect(result.data).toEqual(expectedData);
  })

  it('should return records except commented ones', async () => {
    const mockSheetNames = ['Sheet1']
    const mockSheetData = [{ Field: '# Comment 1', id: 'example id' }, { id: 'id1' }]
    
    // Mock XLSX.readFile
    mockedXLSX.readFile.mockReturnValue({ SheetNames: mockSheetNames, Sheets: { [mockSheetNames[0]]: {} } });

    // Mock XLSX.utils.sheet_to_json
    (mockedXLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockSheetData);

    const fileProcessor = new FileProcessor();

    // Call the method
    const result: ProcessedFile = await fileProcessor.processExcelFile(mockFile);
    

    const expectedData: Map<string, SheetData> = new Map([
      ['Sheet1',
        {
          lineNumberOffset: 3,
          rows: [{ id: 'id1' }]
        }
      ]
    ]);

    // Assertions
    expect(result.fileName).toEqual(mockFileName);
    
    expect(result.data).toEqual(expectedData);
  });
});
