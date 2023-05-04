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

import multer, { StorageEngine } from 'multer';
import uniqid from 'uniqid';

import path from 'path';
import { RequestHandler } from 'express';

const storage: StorageEngine = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '/tmp')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + uniqid() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

export const uploadFile: (field: string) => RequestHandler = (field) => upload.single(field);
