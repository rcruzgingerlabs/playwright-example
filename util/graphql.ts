import { type Request } from "@playwright/test";

export const GRAPHQL_URL = "https://staging.notability.com/graphql";

export type GraphqlRequest = {
  query: string;
};

export function parseGraphqlRequest(request: Request): GraphqlRequest {
  return JSON.parse(request.postData()) as GraphqlRequest;
}
