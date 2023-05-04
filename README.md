# PDCM Lectern Validator
Status: Under development

## Introduction

PDCM Lectern Validator is a web service that allows to validate metadata templates as part of the submision process for [CancerModels.org](https://www.cancermodels.org/submit).

### Input

The service exposes a REST endpoint that allows the user to submit an Excel file containing the metadata to be validated.

### Process

The Excel file is read and transformed into a suitable format to then be validated against a [Lectern](https://github.com/overture-stack/lectern) dictionary. The logic that validates that the Excel content complies with the dictionary definition is provided by the same team that developed Lectern and is published as an npm package at [lectern-client](https://www.npmjs.com/package/@overturebio-stack/lectern-client).

### Output

The output of the process is a JSON file describing any errors in the data.

## Technology

- NodeJS 18.4.0
- TypeScript 4.4.3
- ExpressJS 4.16.1

## How to use

1. Git clone this repo
2. Run `npm install`

## **Scripts**

```
DEBUG=pdcm-lectern-validator:* npm start
```

## Acknowledgments

This project is being developed in collaboration between EBI and [OICR](https://oicr.on.ca/).
