import { type Page } from "@playwright/test";
import { HTTP_OK, HTTP_UNAUTHORIZED } from "@/util/constants";
import {
  GRAPHQL_URL,
  parseGraphqlRequest,
  type GraphqlRequest,
} from "@/util/graphql";

type ResponseType = "success" | "failure";

type MockApiCallFn = (page: Page) => Promise<void>;

type QueryMutationName =
  | "login"
  | "getMe"
  | "getCollabNotes"
  | "updateExperimentData"
  | "getOrganizers";

type HttpStatus = typeof HTTP_OK | typeof HTTP_UNAUTHORIZED;

type QueryMutationDetail = {
  request: string;
  failure?: {
    data: Record<string, unknown>;
    status: HttpStatus;
  };
  success: {
    data: Record<string, unknown>;
    status: typeof HTTP_OK;
  };
};

type GraphqlApi = Record<QueryMutationName, QueryMutationDetail>;

const api: GraphqlApi = {
  getCollabNotes: {
    request: "query getCollabNotes",
    success: {
      data: {
        data: {
          getCollabNotes: [
            {
              id: "24d1e0cf-2abf-446b-a4a5-5fdc276f00c6",
              title: "access-control-policy-bsi.pdf",
              defaultRole: "PRIVATE",
              deletedAt: undefined,
              createdAt: 1736917386648,
              updatedAt: 1737060036903,
              subjectId: null,
              isFavorited: false,
              editors: [
                {
                  user: {
                    id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
                    name: null,
                  },
                },
                {
                  user: {
                    id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
                    name: null,
                  },
                },
                {
                  user: {
                    id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
                    name: null,
                  },
                },
                {
                  user: {
                    id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
                    name: null,
                  },
                },
                {
                  user: {
                    id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
                    name: null,
                  },
                },
              ],
              thumbnailUrl: null,
              thumbnailTimestamp: null,
            },
          ],
        },
      },
      status: HTTP_OK,
    },
  },
  getMe: {
    request: "query getMe",
    success: {
      data: {
        data: {
          featureFlags: [
            "admin_tools",
            "collections",
            "official_collections",
            "show_features",
            "app",
          ],
          me: {
            id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
            email: "rcruz@gingerlabs.com",
            profile: null,
          },
        },
      },
      status: HTTP_OK,
    },
    failure: {
      data: {
        errors: [
          {
            message:
              "Something went wrong. Incident identifier: 1TLbqZNhO6UcfRoP97LfBG",
            key: "internalErrorMessage",
            forceLogOut: false,
          },
        ],
        data: null,
      },
      status: HTTP_UNAUTHORIZED,
    },
  },
  getOrganizers: {
    request: "query getOrganizers",
    success: {
      status: HTTP_OK,
      data: {
        data: {
          getCollabNotes: [],
        },
      },
    },
  },
  login: {
    request: "query login",
    failure: {
      data: {
        errors: [
          {
            message: "Invalid username or password. Please try again.",
            key: "incorrectUsernamePasswordError",
            forceLogOut: false,
          },
        ],
        data: null,
      },
      status: HTTP_UNAUTHORIZED,
    },
    success: {
      data: {
        data: {
          login: {
            id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
            name: null,
            email: "rcruz@gingerlabs.com",
            authToken:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTNjOTZlMy04NWNmLTQyMTItOWQyYy0xY2VlZDU1ZTFmM2IiLCJ2ZXJzaW9uIjoxLCJpYXQiOjE3MzgwMTcxNjJ9.LKC-pbCvde8m_En3vJn5RO8auzM4SFLXKR0swG5AWZw",
            emailVerifiedAt: "2024-10-01T21:00:18.518Z",
            profile: null,
          },
        },
      },
      status: HTTP_OK,
    },
  },
  updateExperimentData: {
    request: "mutation updateExperimentData",
    success: {
      status: HTTP_OK,
      data: {
        data: {
          updateExperimentData: {
            __typename: "ExperimentData",
            experiments: [
              {
                __typename: "ExperimentPlacement",
                experimentName: "Dec 20 is cool",
                variantName: "control",
              },
              {
                __typename: "ExperimentPlacement",
                experimentName: "Dec 20 take THREEE",
                variantName: "control",
              },
            ],
            values: [
              {
                __typename: "ExperimentValueOverride",
                parameterName: "allowTrendingSort",
                value: "false",
              },
            ],
          },
        },
      },
    },
  },
};

let allowLogin = false;

export const setAllowLogin = (allow: boolean) => (allowLogin = allow);

export const mockGraphqlApiCall = async (page: Page) => {
  return await page.route(GRAPHQL_URL, async (route) => {
    const request = route.request();
    const graphqlRequest = parseGraphqlRequest(request);
    const graphqlQuery = graphqlRequest.query.trim();
    if (graphqlQuery.startsWith(api.getCollabNotes.request)) {
      return await route.fulfill({
        json: api.getCollabNotes.success.data,
        status: api.getCollabNotes.success.status,
      });
    } else if (graphqlQuery.startsWith(api.getMe.request)) {
      if (allowLogin) {
        return await route.fulfill({
          json: api.getMe.success.data,
          status: api.getMe.success.status,
        });
      } else if (api.getMe.failure) {
        return await route.fulfill({
          json: api.getMe.failure.data,
          status: api.getMe.failure.status,
        });
      }
    } else if (graphqlQuery.startsWith(api.getOrganizers.request)) {
      return await route.fulfill({
        json: api.getOrganizers.success.data,
        status: api.getOrganizers.success.status,
      });
    } else if (graphqlQuery.startsWith(api.login.request)) {
      if (allowLogin) {
        return await route.fulfill({
          json: api.login.success.data,
          status: api.login.success.status,
        });
      } else if (api.login.failure) {
        return await route.fulfill({
          json: api.login.failure.data,
          status: api.login.failure.status,
        });
      }
    } else if (graphqlQuery.startsWith(api.updateExperimentData.request)) {
      return await route.fulfill({
        json: api.updateExperimentData.success.data,
        status: api.updateExperimentData.success.status,
      });
    }
  });
};

export const mockLoginApiCallStaging: MockApiCallFn = async (
  page,
  responseType = "success"
) => {
  await page.route(
    "https://staging.notability.com/auth/login",
    async (route) => {
      if (responseType === "success") {
        await route.fulfill({
          json: {
            userId: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
            email: "rcruz@gingerlabs.com",
            avatarUrl: null,
            emailVerifiedAt: "2025-01-01T21:00:18.518Z",
            avatarUpdatedAt: null,
            dismissGuidelines: false,
          },
          status: HTTP_OK,
        });
      } else {
        await route.fulfill({
          json: {
            message: "Invalid username or password. Please try again.",
            key: "incorrectUsernamePasswordError",
            forceLogOut: false,
          },
          status: HTTP_UNAUTHORIZED,
        });
      }
    }
  );
};

export const mockLoginApiCallLocal: MockApiCallFn = async (
  page,
  responseType = "success"
) => {
  console.log("entering mockLoginApiCallLocal");
  return await page.route(GRAPHQL_URL, async (route) => {
    const request = route.request();
    const graphqlRequest = parseGraphqlRequest(request);
    const graphqlQuery = graphqlRequest.query.trim();
    console.log("mockLoginApiCallLocal: %o", responseType);
    if (graphqlQuery.startsWith("query login")) {
      console.log("verfied query login");
      if (responseType === "success") {
        console.log("mocking success");
        return await route.fulfill({
          json: {
            data: {
              login: {
                id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
                name: null,
                email: "rcruz@gingerlabs.com",
                authToken:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTNjOTZlMy04NWNmLTQyMTItOWQyYy0xY2VlZDU1ZTFmM2IiLCJ2ZXJzaW9uIjoxLCJpYXQiOjE3MzgwMTcxNjJ9.LKC-pbCvde8m_En3vJn5RO8auzM4SFLXKR0swG5AWZw",
                emailVerifiedAt: "2024-10-01T21:00:18.518Z",
                profile: null,
              },
            },
          },
          status: 200,
        });
      } else {
        return await route.fulfill({
          json: {
            errors: [
              {
                message: "Invalid username or password. Please try again.",
                key: "incorrectUsernamePasswordError",
                forceLogOut: false,
              },
            ],
            data: null,
          },
          status: HTTP_UNAUTHORIZED,
        });
      }
    }
  });
};

export const mockGetMeApiCall: MockApiCallFn = async (
  page,
  responseType = "success"
) => {
  return await page.route(GRAPHQL_URL, async (route) => {
    const request = route.request();
    const graphqlRequest = parseGraphqlRequest(request);
    const graphqlQuery = graphqlRequest.query.trim();
    if (graphqlQuery.startsWith("query getMe")) {
      if (responseType === "success") {
        return await route.fulfill({
          json: {
            data: {
              featureFlags: [
                "admin_tools",
                "collections",
                "official_collections",
                "show_features",
                "app",
              ],
              me: {
                id: "0e3c96e3-85cf-4212-9d2c-1ceed55e1f3b",
                email: "rcruz@gingerlabs.com",
                profile: null,
              },
            },
          },
          status: HTTP_OK,
        });
      } else {
        return await route.fulfill({
          json: {
            errors: [
              {
                message:
                  "Something went wrong. Incident identifier: 1TLbqZNhO6UcfRoP97LfBG",
                key: "internalErrorMessage",
                forceLogOut: false,
              },
            ],
            data: null,
          },
        });
      }
    }
  });
};

export const mockUpdateExperimentDataApiCall: MockApiCallFn = async (
  page,
  responseType = "success"
) => {
  return await page.route(GRAPHQL_URL, async (route) => {
    const request = route.request();
    const graphqlRequest = parseGraphqlRequest(request);
    const graphqlQuery = graphqlRequest.query.trim();
    if (graphqlQuery.startsWith("mutation updateExperimentData")) {
      if (responseType === "success") {
        return await route.fulfill({
          json: {
            data: {
              updateExperimentData: {
                __typename: "ExperimentData",
                experiments: [
                  {
                    __typename: "ExperimentPlacement",
                    experimentName: "Dec 20 is cool",
                    variantName: "control",
                  },
                  {
                    __typename: "ExperimentPlacement",
                    experimentName: "Dec 20 take THREEE",
                    variantName: "control",
                  },
                ],
                values: [
                  {
                    __typename: "ExperimentValueOverride",
                    parameterName: "allowTrendingSort",
                    value: "false",
                  },
                ],
              },
            },
          },
          status: HTTP_OK,
        });
      }
    }
  });
};

export const mockGetOrganizersApiCall: MockApiCallFn = async (
  page,
  responseType = "success"
) => {
  return await page.route(GRAPHQL_URL, async (route) => {
    const request = route.request();
    const graphqlRequest = parseGraphqlRequest(request);
    const graphqlQuery = graphqlRequest.query.trim();
    if (graphqlQuery.startsWith("query getOrganizers")) {
      if (responseType === "success") {
        return await route.fulfill({
          json: { data: { getOrganizers: [] } },
          status: HTTP_OK,
        });
      }
    }
  });
};

export const mockGetCollabNotesApiCall: MockApiCallFn = async (
  page,
  responseType = "success"
) => {
  return await page.route(GRAPHQL_URL, async (route) => {
    const request = route.request();
    const graphqlRequest = parseGraphqlRequest(request);
    const graphqlQuery = graphqlRequest.query.trim();
    if (graphqlQuery.startsWith("query getCollabNotes")) {
      if (responseType === "success") {
        return await route.fulfill({
          json: {
            data: {
              getCollabNotes: [],
            },
          },
          status: HTTP_OK,
        });
      }
    }
  });
};
