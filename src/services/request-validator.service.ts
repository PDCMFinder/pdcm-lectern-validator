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

import { BadRequest } from "@/exceptions/bad-request.exception";
import { Request } from "express";

const AcceptedFormats = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"]

const validateFileExists = (file: Express.Multer.File | undefined) => {
    if (!file) {
        throw new BadRequest(400, `No file uploaded`);
    }
}

const validateFileType = (file: Express.Multer.File | undefined) => {
    const mimetype = file?.mimetype;
    if (!mimetype || !AcceptedFormats.includes(mimetype)) {
        throw new BadRequest(
            400,
            `Please upload an Excel file. Expected: ${AcceptedFormats}. Obtained: ${mimetype}.`);
    }
}

export const validateRequest = (request: Request) => {
    validateFileExists(request.file);
    validateFileType(request.file);
}