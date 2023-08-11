const request = require('supertest');
const app = require('../../src/app');
import * as dictionaryService from '../../src/services/dictionary.service';
import { ConfigurationException } from '../../src/exceptions/configuration.exception';
import { SchemasDictionary } from '@overturebio-stack/lectern-client/lib/schema-entities';
import { promisify } from 'util';
const ServerMock: any = require('mock-http-server') as any;
const server = new ServerMock({ host: 'localhost', port: 54321 });

beforeAll(async () => {
  await promisify(server.start)();
});

afterAll(async () => {
  await promisify(server.stop)();
});

describe('Excel file validator', () => {

  it('should throw error when no file is uploaded', async () => {
    const response = await request(app).post('/validation/upload-excel');
    expect(response.statusCode).toEqual(400);
    expect(response.text).toEqual("No file uploaded");
  })

  it('should throw error when no dictionary service has not been correctly initialized', async () => {
    const filePath = `${__dirname}/test_files/test_file.xlsx`;
    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);
    expect(response.statusCode).toEqual(500);
    expect(response.text).toEqual("Validator Service not initialized, you should call create first");
  })

  it('should throw error when Lectern is not running', async () => {
    const dictionaryServiceUrl = 'http://mocked-url';
    // Set a dictionary
    dictionaryService.create(dictionaryServiceUrl);

    await expect(
      dictionaryService.instance().loadValidationDictionary("dictionaryName", "dictionaryVersion")
    ).rejects.toThrow(new ConfigurationException("Could not fetch dictionary from http://mocked-url. Check that Lectern is running and that a dictionary named [dictionaryName] with version dictionaryVersion exists."));

  })

  it('should fail when dictionary does not exist', async () => {
    const dictionaryServiceUrl = 'http://mocked-url';
    const filePath = `${__dirname}/test_files/test_file.xlsx`;
    // Set a dictionary
    dictionaryService.create(dictionaryServiceUrl);
    const response = await request(app).post('/validation/upload-excel').attach('file', filePath);

    expect(response.statusCode).toEqual(500);
    expect(response.text).toEqual("File could not be validated because a suitable dictionary to validate against was not found");

  })

  it('should pass when using default dictionary and a valid file', async () => {
    const dictionaryServiceUrl = 'http://localhost';
    const filePath = `${__dirname}/test_files/test_file.xlsx`;
    // Set a dictionary
    dictionaryService.create('http://localhost:54321/lectern');
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