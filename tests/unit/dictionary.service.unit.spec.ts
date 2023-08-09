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

import { DictionaryService } from '../../src/services/dictionary.service';
import { ConfigurationException } from '@/exceptions/configuration.exception';

jest.mock('@overturebio-stack/lectern-client', () => ({
    restClient: {
        fetchSchema: jest.fn(),
    },
}));

const mockedDictionaryRestClient = require('@overturebio-stack/lectern-client')
    .restClient as jest.Mocked<typeof import('@overturebio-stack/lectern-client').restClient>;

describe('DictionaryService', () => {
    const dictionaryServiceUrl = 'http://mocked-url';
    const dictionaryName = 'CancerModels_Dictionary';
    const dictionaryVersion = '1.0';

    let dictionaryService: DictionaryService;

    beforeEach(() => {
        dictionaryService = new DictionaryService(dictionaryServiceUrl);
    });

    it('should load validation dictionary successfully', async () => {
        const mockValidationDictionary = {}; // Mocked dictionary object

        (mockedDictionaryRestClient.fetchSchema as jest.Mock).mockResolvedValue(mockValidationDictionary);

        const result = await dictionaryService.loadValidationDictionary(dictionaryName, dictionaryVersion);

        expect(result).toBe(mockValidationDictionary);
    });

    it('should throw ConfigurationException if fetchSchema fails', async () => {
        const errorMessage = 'Fetch error';

        mockedDictionaryRestClient.fetchSchema.mockRejectedValue(errorMessage);

        const expectedErrorMessage = `Could not fetch dictionary from ${dictionaryServiceUrl}.`
            + ` Check that Lectern is running and that a dictionary named [CancerModels_Dictionary] with version 1.0 exists.`;

        await expect(
            dictionaryService.loadValidationDictionary(dictionaryName, dictionaryVersion)
        ).rejects.toThrow(new ConfigurationException(expectedErrorMessage));
    });

    it('should load schema by version', async () => {
        const mockSchema = {}; // Mocked schema object

        (mockedDictionaryRestClient.fetchSchema as jest.Mock).mockResolvedValue(mockSchema);

        const result = await dictionaryService.loadSchemaByVersion(dictionaryName, dictionaryVersion);

        expect(result).toBe(mockSchema);
    });

    it('should throw an error if loadSchemaByVersion fails', async () => {
        const errorMessage = 'Fetch error';

        mockedDictionaryRestClient.fetchSchema.mockRejectedValue(errorMessage);

        await expect(
            dictionaryService.loadSchemaByVersion(dictionaryName, dictionaryVersion)
        ).rejects.toThrow(Error);
    });

    // Write more tests for other methods
});
