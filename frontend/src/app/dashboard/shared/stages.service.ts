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

import {Injectable} from '@angular/core';
import {ApiService} from 'app/api.service';
import {Pipeline} from 'app/models/pipeline';
import {Stage} from 'app/models/stage';

@Injectable()
export class StagesService extends ApiService {
  private url = `${this.getHost()}/stages`;

  getStages() {
    return this.http.get(this.url, this.options)
        .toPromise()
        .then(res => res as Stage[])
        .catch(this.handleError);
  }

  addStage(stage_data) {
    return this.http.post(this.url, JSON.stringify(stage_data), this.options)
        .toPromise()
        .then(res => res as Stage)
        .catch(this.handleError);
  }

  deleteStage(id) {
    return this.http.delete(this.getStageUrl(id))
        .toPromise()
        .catch(this.handleError);
  }

  getPipelinesForAllStages(stages) {
    const promises = [];
    for (const stage of stages) {
      promises.push(this.getPipelinesForStage(stage));
    }
    return promises;
  }

  getPipelinesForStage(stage) {
    return this.http.get(this.getPipelinesUrl(stage.sid), this.options)
        .toPromise()
        .then(res => {
          const pipelines = res as Pipeline[];
          for (const pipeline of pipelines) {
            pipeline.sid = stage.sid;
          }
          return pipelines;
        })
        .catch(this.handleError);
  }

  private getStageUrl(id) {
    return this.url + '/' + id;
  }

  private getPipelinesUrl(sid) {
    return `https://api-service-dot-${sid}.appspot.com/pipelines`;
  }
}
