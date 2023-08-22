# PDCM Lectern Validator
![Project Status](https://img.shields.io/badge/status-under%20development-blue)

## Introduction

The PDCM Lectern Validator is a web service designed to streamline the metadata validation process within the submission workflow for [CancerModels.org](https://www.cancermodels.org/submit).

### Features

- Validate metadata templates.
- Feedback on metadata errors.

## Table of Contents

- [REST API Endpoints](#rest-api-endpoints)
    - [Summary table](#summary-table)
- [Input](#input)
- [Process](#process)
- [Output](#output)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Acknowledgments](#acknowledgments)

# REST API Endpoints
## Summary table

| Endpoint                   | Description                                                 | HTTP Method |
|----------------------------|-------------------------------------------------------------|-------------|
| `/validation/upload-excel` | Validates an Excel file against a Lectern dictionary        | POST        |
| `/dictionary`              | Get the current Lectern Dictionary used for the validations | GET         |

## /validation/upload-excel
Validates an Excel file against a Lectern dictionary.

**HTTP Method**: POST
### Form Parameters
file: The file to validate
### Response
#### Supported Media Types
- application/json
#### 200 Response
The Excel file was validated

##### Body
Example
```
{
    "date": "2023-08-22T08:34:30.541Z",
    "fileName": "missing_required_field.xlsx",
    "status": "invalid",
    "dictionaryName": "CancerModels_Dictionary",
    "dictionaryVersion": "1.0",
    "sheetsValidationResults": [
        {
            "sheetName": "patient",
            "status": "invalid",
            "result": [
                {
                    "errorType": "Missing required field",
                    "index": 2,
                    "fieldName": "patient_id",
                    "info": {
                        "format": "Alphanumeric"
                    },
                    "message": "A required field is missing from the input data."
                }
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
}
```
#### 400 Response
Bad request.
Common errors are:
- The file was not sent in the request.
- The file contains sheets that are not in the dictionary.

#### 500 Response
Internal Server Error.
Common errors are:
- The Lectern service is not running.
- The database is not up.
- There is not a valid dictionaty configured in the system.

## /dictionary
Get the current Lectern Dictionary used for the validations.

**HTTP Method**: GET
### Response
#### Supported Media Types
- application/json
#### 200 Response
The Lectern dictionary currently used for the validations.

## Input

The service offers a RESTful API endpoint, allowing users to submit Excel files containing metadata to be validated.

## Process

Uploaded Excel files are transformed into a suitable format before undergoing validation against the [Lectern](https://github.com/overture-stack/lectern) dictionary. The validation logic is powered by the dedicated team behind Lectern and is available as an npm package, [lectern-client](https://www.npmjs.com/package/@overturebio-stack/lectern-client).

## Output

Upon completion, the service generates a detailed JSON report, highlighting any errors detected during the validation process.

### Possible errors

#### Value error
The field only accepts values from a restricted list and the current value does not match any of the allowed values.

#### Invalid format
The field's value does not comply with the defined regular expression pattern.

#### Missing required field
The field is required but the current value is empty/null.

#### Unrecognized field
The submitted data has a field which is not in the schema.

## Technology Stack

- Node.js 18.4.0
- TypeScript 4.4.3
- Express.js 4.16.1

## Getting Started

### Clone the repository
Clone this repository using `git clone`.

### Mongo DB and Lectern
This validator needs a Mongo db and an instance of Lectern.

#### Mongo DB setup
You can use the file `docker-compose.yaml` to start a docker container with a mongo db, which is useful for development purposes. 
`docker-compose up -d`.

If you use this container, the Mongo instance will be listening on the port 27272 of the host machine.

#### Lectern setup
You can read the documentation at https://github.com/overture-stack/lectern to clone the code and start the service. An important part of the setup is to create a suitable `.env` where you set the credentials to connect to the Mongo db.


### Install project dependencies
Install project dependencies by running `yarn install`.

## Usage

Start the server using the following command:

```bash
yarn start
```

## Acknowledgments

This project is being developed in collaboration between EBI and [OICR](https://oicr.on.ca/).
