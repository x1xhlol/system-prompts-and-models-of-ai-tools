"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// builds/node.ts
var node_exports = {};
__export(node_exports, {
  algoliasearch: () => algoliasearch,
  apiClientVersion: () => import_client_search.apiClientVersion
});
module.exports = __toCommonJS(node_exports);
var import_abtesting = require("@algolia/abtesting");
var import_client_abtesting = require("@algolia/client-abtesting");
var import_client_analytics = require("@algolia/client-analytics");
var import_client_insights = require("@algolia/client-insights");
var import_client_personalization = require("@algolia/client-personalization");
var import_client_query_suggestions = require("@algolia/client-query-suggestions");
var import_client_search2 = require("@algolia/client-search");
var import_ingestion = require("@algolia/ingestion");
var import_monitoring = require("@algolia/monitoring");
var import_recommend = require("@algolia/recommend");

// builds/models.ts
var models_exports = {};
__export(models_exports, {
  apiClientVersion: () => import_client_search.apiClientVersion
});
var import_client_search = require("@algolia/client-search");
__reExport(models_exports, require("@algolia/abtesting"));
__reExport(models_exports, require("@algolia/client-abtesting"));
__reExport(models_exports, require("@algolia/client-analytics"));
__reExport(models_exports, require("@algolia/client-insights"));
__reExport(models_exports, require("@algolia/client-personalization"));
__reExport(models_exports, require("@algolia/client-query-suggestions"));
__reExport(models_exports, require("@algolia/client-search"));
__reExport(models_exports, require("@algolia/ingestion"));
__reExport(models_exports, require("@algolia/monitoring"));
__reExport(models_exports, require("@algolia/recommend"));

// builds/node.ts
__reExport(node_exports, models_exports, module.exports);
function algoliasearch(appId, apiKey, options) {
  if (!appId || typeof appId !== "string") {
    throw new Error("`appId` is missing.");
  }
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("`apiKey` is missing.");
  }
  const client = (0, import_client_search2.searchClient)(appId, apiKey, options);
  let ingestionTransporter;
  if (options == null ? void 0 : options.transformation) {
    if (!options.transformation.region) {
      throw new Error("`region` must be provided when leveraging the transformation pipeline");
    }
    ingestionTransporter = (0, import_ingestion.ingestionClient)(appId, apiKey, options.transformation.region, options);
  }
  return {
    ...client,
    async saveObjectsWithTransformation({ indexName, objects, waitForTasks }, requestOptions) {
      var _a;
      if (!ingestionTransporter) {
        throw new Error("`transformation.region` must be provided at client instantiation before calling this method.");
      }
      if (!((_a = options == null ? void 0 : options.transformation) == null ? void 0 : _a.region)) {
        throw new Error("`region` must be provided when leveraging the transformation pipeline");
      }
      return ingestionTransporter.chunkedPush(
        { indexName, objects, action: "addObject", waitForTasks },
        requestOptions
      );
    },
    async partialUpdateObjectsWithTransformation({ indexName, objects, createIfNotExists, waitForTasks }, requestOptions) {
      var _a;
      if (!ingestionTransporter) {
        throw new Error("`transformation.region` must be provided at client instantiation before calling this method.");
      }
      if (!((_a = options == null ? void 0 : options.transformation) == null ? void 0 : _a.region)) {
        throw new Error("`region` must be provided when leveraging the transformation pipeline");
      }
      return ingestionTransporter.chunkedPush(
        {
          indexName,
          objects,
          action: createIfNotExists ? "partialUpdateObject" : "partialUpdateObjectNoCreate",
          waitForTasks
        },
        requestOptions
      );
    },
    async replaceAllObjectsWithTransformation({ indexName, objects, batchSize, scopes }, requestOptions) {
      var _a;
      if (!ingestionTransporter) {
        throw new Error("`transformation.region` must be provided at client instantiation before calling this method.");
      }
      if (!((_a = options == null ? void 0 : options.transformation) == null ? void 0 : _a.region)) {
        throw new Error("`region` must be provided when leveraging the transformation pipeline");
      }
      const randomSuffix = Math.floor(Math.random() * 1e6) + 1e5;
      const tmpIndexName = `${indexName}_tmp_${randomSuffix}`;
      if (scopes === void 0) {
        scopes = ["settings", "rules", "synonyms"];
      }
      try {
        let copyOperationResponse = await this.operationIndex(
          {
            indexName,
            operationIndexParams: {
              operation: "copy",
              destination: tmpIndexName,
              scope: scopes
            }
          },
          requestOptions
        );
        const watchResponses = await ingestionTransporter.chunkedPush(
          { indexName: tmpIndexName, objects, waitForTasks: true, batchSize, referenceIndexName: indexName },
          requestOptions
        );
        await this.waitForTask({
          indexName: tmpIndexName,
          taskID: copyOperationResponse.taskID
        });
        copyOperationResponse = await this.operationIndex(
          {
            indexName,
            operationIndexParams: {
              operation: "copy",
              destination: tmpIndexName,
              scope: scopes
            }
          },
          requestOptions
        );
        await this.waitForTask({
          indexName: tmpIndexName,
          taskID: copyOperationResponse.taskID
        });
        const moveOperationResponse = await this.operationIndex(
          {
            indexName: tmpIndexName,
            operationIndexParams: { operation: "move", destination: indexName }
          },
          requestOptions
        );
        await this.waitForTask({
          indexName: tmpIndexName,
          taskID: moveOperationResponse.taskID
        });
        return { copyOperationResponse, watchResponses, moveOperationResponse };
      } catch (error) {
        await this.deleteIndex({ indexName: tmpIndexName });
        throw error;
      }
    },
    /**
     * Get the value of the `algoliaAgent`, used by our libraries internally and telemetry system.
     */
    get _ua() {
      return client.transporter.algoliaAgent.value;
    },
    initAbtesting: (initOptions) => {
      return (0, import_client_abtesting.abtestingClient)(
        initOptions.appId || appId,
        initOptions.apiKey || apiKey,
        initOptions.region,
        initOptions.options
      );
    },
    initAbtestingV3: (initOptions) => {
      return (0, import_abtesting.abtestingV3Client)(
        initOptions.appId || appId,
        initOptions.apiKey || apiKey,
        initOptions.region,
        initOptions.options
      );
    },
    initAnalytics: (initOptions) => {
      return (0, import_client_analytics.analyticsClient)(
        initOptions.appId || appId,
        initOptions.apiKey || apiKey,
        initOptions.region,
        initOptions.options
      );
    },
    initIngestion: (initOptions) => {
      return (0, import_ingestion.ingestionClient)(
        initOptions.appId || appId,
        initOptions.apiKey || apiKey,
        initOptions.region,
        initOptions.options
      );
    },
    initInsights: (initOptions) => {
      return (0, import_client_insights.insightsClient)(
        initOptions.appId || appId,
        initOptions.apiKey || apiKey,
        initOptions.region,
        initOptions.options
      );
    },
    initMonitoring: (initOptions = {}) => {
      return (0, import_monitoring.monitoringClient)(initOptions.appId || appId, initOptions.apiKey || apiKey, initOptions.options);
    },
    initPersonalization: (initOptions) => {
      return (0, import_client_personalization.personalizationClient)(
        initOptions.appId || appId,
        initOptions.apiKey || apiKey,
        initOptions.region,
        initOptions.options
      );
    },
    initQuerySuggestions: (initOptions) => {
      return (0, import_client_query_suggestions.querySuggestionsClient)(
        initOptions.appId || appId,
        initOptions.apiKey || apiKey,
        initOptions.region,
        initOptions.options
      );
    },
    initRecommend: (initOptions = {}) => {
      return (0, import_recommend.recommendClient)(initOptions.appId || appId, initOptions.apiKey || apiKey, initOptions.options);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  algoliasearch,
  apiClientVersion
});
//# sourceMappingURL=node.cjs.map