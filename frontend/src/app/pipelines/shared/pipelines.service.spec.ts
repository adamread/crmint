// Copyright 2018 Google Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* tslint:disable:no-unused-variable */

import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {async, inject, TestBed} from '@angular/core/testing';
import {Pipeline} from 'app/models/pipeline';

import {PipelinesService} from './pipelines.service';

const samplePipeline = JSON.parse(`
{
  "params": [
    {
      "type": "text",
      "name": "BQ_DATASET",
      "value": "predict_realestate_brasil"
    },
    {
      "type": "text",
      "name": "BQ_PROJECT",
      "value": ""
    }
  ],
  "jobs": [
    {
      "hash_start_conditions": [],
      "worker_class": "BQMLTrainer",
      "params": [
        {
          "description": null,
          "value": "#standardSQL\n\nCREATE MODEL \`{% BQ_DATASET %}.price_model\`\nOPTIONS (\n    model_type='linear_reg',\n    early_stop=False,\n    max_iterations=10,\n    input_label_cols=['price']\n) AS\nSELECT \n  property_type,\n  state_name,\n  price,\n  surface_covered_in_m2,\n  rooms,\n  (surface_covered_in_m2 / rooms) AS room_avg_surface,\n  LENGTH(description) AS desc_length\nFROM \`properati - data - public.properties_br.properties_sell_201802\`\nWHERE \n  currency = 'BRL'\n  AND surface_covered_in_m2 IS NOT NULL\n  AND surface_covered_in_m2 > 1\n  AND rooms IS NOT NULL\n  AND MOD(ABS(FARM_FINGERPRINT(id)), 10) < 7",
          "label": null,
          "is_required": false,
          "type": "sql",
          "name": "query"
        },
        {
          "description": null,
          "value": "{% BQ_PROJECT %}",
          "label": null,
          "is_required": false,
          "type": "string",
          "name": "bq_project_id"
        }
      ],
      "id": "c831586b04a1420cadaf9598c14c7f16",
      "name": "Train Model"
    },
    {
      "hash_start_conditions": [
        {
          "preceding_job_id": "c831586b04a1420cadaf9598c14c7f16",
          "condition": "success"
        }
      ],
      "worker_class": "BQQueryLauncher",
      "params": [
        {
          "description": null,
          "value": "#standardSQL\n\nWITH prices AS (\n    SELECT \n      property_type,\n      state_name,\n      price,\n      surface_covered_in_m2,\n      rooms,\n      (surface_covered_in_m2 / rooms) AS room_avg_surface,\n      LENGTH(description) AS desc_length\n    FROM \`properati - data - public.properties_br.properties_sell_201802\`\n    WHERE \n      currency = 'BRL'\n      AND surface_covered_in_m2 IS NOT NULL\n      AND surface_covered_in_m2 > 1\n      AND rooms IS NOT NULL\n      AND MOD(ABS(FARM_FINGERPRINT(id)), 10) >= 7\n)\nSELECT\n  *\nFROM ML.EVALUATE(MODEL \`{% BQ_DATASET %}.price_model\`,\n  (\n    SELECT\n      *\n    FROM prices\n  ));",
          "label": null,
          "is_required": false,
          "type": "sql",
          "name": "query"
        },
        {
          "description": null,
          "value": "{% BQ_PROJECT %}",
          "label": null,
          "is_required": false,
          "type": "string",
          "name": "bq_project_id"
        },
        {
          "description": null,
          "value": "{% BQ_DATASET %}",
          "label": null,
          "is_required": false,
          "type": "string",
          "name": "bq_dataset_id"
        },
        {
          "description": null,
          "value": "price_model_evaluation",
          "label": null,
          "is_required": false,
          "type": "string",
          "name": "bq_table_id"
        },
        {
          "description": null,
          "value": true,
          "label": null,
          "is_required": false,
          "type": "boolean",
          "name": "overwrite"
        }
      ],
      "id": "bad5db3ad30a4cb0acd9a4ea394c5cd3",
      "name": "Evaluate Model"
    }
  ],
  "name": "BQML Brasil Real Estate Price Model",
  "schedules": []
}
`);


describe('Service: Pipeline', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule(
        {imports: [HttpClientTestingModule], providers: [PipelinesService]});

    httpMock = TestBed.get(HttpTestingController);
  });

  it('should successfully retrieve the list of pipelines',
     async(inject([PipelinesService], (service: PipelinesService) => {
       const piplineList =
           [samplePipeline as Pipeline, samplePipeline as Pipeline];
       const response = (service.getPipelines());
       let pipelineRequest = httpMock.expectOne('/pipelines');
       pipelineRequest.flush(piplineList);
       response.then((value) => {
         expect(value.length).toEqual(2);
         expect(value).toEqual(piplineList);
       });
     })));
});
