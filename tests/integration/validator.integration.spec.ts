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

const request = require('supertest');
const app = require('../../src/app');
import * as dictionaryService from '../../src/services/dictionary.service';
import { ConfigurationException } from '../../src/exceptions/configuration.exception';
import { SchemasDictionary } from '@overturebio-stack/lectern-client/lib/schema-entities';
import { promisify } from 'util';
const ServerMock: any = require('mock-http-server') as any;
const server = new ServerMock({ host: 'localhost', port: 54321 });
const mockedDictionaryServiceUrl = 'http://localhost:54321/lectern';

beforeAll(async () => {
  await promisify(server.start)();
});

afterAll(async () => {
  await promisify(server.stop)();
});

const mockDictionaryResponse = () => {
  dictionaryService.create(mockedDictionaryServiceUrl);
  const dictionaryPath = `${__dirname}/test_files/CancerModels_dictionary_1.0.json`;
  const mockValidationDictionary: SchemasDictionary = require(dictionaryPath);

  server.on({
    method: 'GET',
    path: '/lectern/dictionaries',
    reply: {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: () => {
        return JSON.stringify(mockValidationDictionary);
      },
    },
  });
};

describe('Server configuration errors', () => {

  it('should throw error when no dictionary service has not been correctly initialized', async () => {
    const filePath = `${__dirname}/test_files/schema_ok_data_empty.xlsx`;
    const mockExit = jest.spyOn(process, 'exit')
      .mockImplementation((number) => { throw new Error('process.exit: ' + number); });

    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();

    const expectedResponse = {
      name: 'Internal server error',
      message: 'Application will shut down. Please inform the admin team.',
      details: 'Validator Service not initialized, you should call create first.'
    }

    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.text)).toEqual(expectedResponse);
  })

  it('should throw error when Lectern is not running', async () => {
    // Set a dictionary
    dictionaryService.create(mockedDictionaryServiceUrl);

    await expect(
      dictionaryService.instance().loadValidationDictionary("dictionaryName", "dictionaryVersion")
    ).rejects.toThrow(new ConfigurationException(`Could not fetch dictionary from ${mockedDictionaryServiceUrl}. Check that Lectern is running.`));

  })

  it('should fail when dictionary does not exist', async () => {
    const filePath = `${__dirname}/test_files/schema_ok_data_empty.xlsx`;
    // Set a dictionary url but not mocking a response from Lectern, so the dictionary would be undefined.
    dictionaryService.create(mockedDictionaryServiceUrl);

    // Configuration error so this should shut the app down.
    const mockExit = jest.spyOn(process, 'exit')
      .mockImplementation((number) => { throw new Error('process.exit: ' + number); });

    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();

    const expectedResponse = {
      name: 'Internal server error',
      message: 'Application will shut down. Please inform the admin team.',
      details: 'File could not be validated because a suitable dictionary to validate against was not found.'
    }

    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.text)).toEqual(expectedResponse);
  })
})

describe('Request related errors', () => {
  it('should throw error when no file is uploaded', async () => {
    // Calling the endpoint without attaching a file
    const response = await request(app).post('/validation/upload-excel');

    const expectedResponse = {
      name: 'Bad request error',
      message: 'No file uploaded'
    }
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.text)).toEqual(expectedResponse);
  })

  it('should report unknown sheet when the file has a sheet that is not defined as a schema in the dictionary', async () => {
    const filePath = `${__dirname}/test_files/extra_sheet.xlsx`;

    mockDictionaryResponse();

    // Load the lectern dictionary. It would use the mock http server so the returned dictionary would be taken from a file.
    await dictionaryService.instance().loadValidationDictionary("schemaName", '1.0');

    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);

    const expectedResponse = {
      name: 'Bad request error',
      message: 'Sheets: [extra_sheet] not found in the dictionary'
    }
    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.text)).toEqual(expectedResponse);
  })

})

describe('Happy path scenarios', () => {
  it('should pass when using default dictionary and a valid file', async () => {
    const filePath = `${__dirname}/test_files/schema_ok_data_empty.xlsx`;

    mockDictionaryResponse();

    // Load the lectern dictionary. It would use the mock http server so the returned dictionary would be taken from a file.
    await dictionaryService.instance().loadValidationDictionary("schemaName", '1.0');

    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);
    const resultAsJSON = JSON.parse(response.text);

    const sheetsValidationResults = [
      {
        "sheetName": "patient",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "patient_sample",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "pdx_model",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "model_validation",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "cell_model",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "sharing",
        "status": "valid",
        "result": []
      }
    ]

    expect(response.statusCode).toEqual(201);
    expect(resultAsJSON['sheetsValidationResults']).toEqual(sheetsValidationResults);
  })
})

describe('Restrictions validated by Lectern/Lectern client', () => {

  it('should report an error if a required field does not have a value', async () => {
    const filePath = `${__dirname}/test_files/missing_required_field.xlsx`;

    mockDictionaryResponse();

    // Load the lectern dictionary. It would use the mock http server so the returned dictionary would be taken from a file.
    await dictionaryService.instance().loadValidationDictionary("schemaName", '1.0');

    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);
    const resultAsJSON = JSON.parse(response.text);

    const sheetsValidationResults = [
      {
        "sheetName": "patient",
        "status": "invalid",
        "result": [
          {
            errorType: "MISSING_REQUIRED_FIELD",
            fieldName: "patient_id",
            index: 2,
            info: {},
            message: "patient_id is a required field.",
          },
        ]
      },
      {
        "sheetName": "patient_sample",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "pdx_model",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "model_validation",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "cell_model",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "sharing",
        "status": "valid",
        "result": []
      }
    ]

    expect(response.statusCode).toEqual(201);
    expect(resultAsJSON['sheetsValidationResults']).toEqual(sheetsValidationResults);
  })

  it('should report an error if a field with a codeList restriction does not have a valid value', async () => {
    const filePath = `${__dirname}/test_files/invalid_code_list.xlsx`;

    mockDictionaryResponse();

    // Load the lectern dictionary. It would use the mock http server so the returned dictionary would be taken from a file.
    await dictionaryService.instance().loadValidationDictionary("schemaName", '1.0');

    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);
    const resultAsJSON = JSON.parse(response.text);

    const sheetsValidationResults = [
      {
        "sheetName": "patient",
        "status": "invalid",
        "result": [
          {
            errorType: "INVALID_ENUM_VALUE",
            fieldName: "sex",
            index: 2,
            info: {
              value: [
                "invalid_sex_value",
              ],
            },
            message: "The value is not permissible for this field.",
          },
        ]
      },
      {
        "sheetName": "patient_sample",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "pdx_model",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "model_validation",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "cell_model",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "sharing",
        "status": "valid",
        "result": []
      }
    ]

    expect(response.statusCode).toEqual(201);
    expect(resultAsJSON['sheetsValidationResults']).toEqual(sheetsValidationResults);
  })

  it('should report an error if there is an unrecognised field in the Excel file', async () => {
    const filePath = `${__dirname}/test_files/unrecognized_field.xlsx`;

    mockDictionaryResponse();

    // Load the lectern dictionary. It would use the mock http server so the returned dictionary would be taken from a file.
    await dictionaryService.instance().loadValidationDictionary("schemaName", '1.0');

    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);
    const resultAsJSON = JSON.parse(response.text);

    const sheetsValidationResults = [
      {
        "sheetName": "patient",
        "status": "invalid",
        "result": [
          {
            errorType: "UNRECOGNIZED_FIELD",
            fieldName: "field_x",
            index: 0,
            info: {},
            message: "UNRECOGNIZED_FIELD",
          },
        ]
      },
      {
        "sheetName": "patient_sample",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "pdx_model",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "model_validation",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "cell_model",
        "status": "valid",
        "result": []
      },
      {
        "sheetName": "sharing",
        "status": "valid",
        "result": []
      }
    ]

    expect(response.statusCode).toEqual(201);
    expect(resultAsJSON['sheetsValidationResults']).toEqual(sheetsValidationResults);
  })

})
