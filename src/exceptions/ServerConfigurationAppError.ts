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

import { AppError, HttpCode } from "./AppError";

/**
 * Error in the configuration of the server. Examples:
 * - Lectern is not up.
 * - Database is not up.
 * - Validation dictionary was not found.
 * - Validation dictionary has not been configured.
 * 
 * This type of error will make the app shut down as it needs something to be fixed on the server side and then restart the application.
 */
export class ServerConfigurationAppError extends AppError {
    constructor(description: string) {
        super({ name: 'Server configuration error', httpCode: HttpCode.INTERNAL_SERVER_ERROR, description, isOperational: false })
    }
}