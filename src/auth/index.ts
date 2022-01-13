import { LOGIN, REFRESH } from "../common/api";
import { Context, ConnectionOptions } from "../types";

type Login = {
  access_token: string;
  refresh_token: string;
};

export class Authenticator {
  context: Context;
  options: ConnectionOptions;

  accessToken?: string;
  refreshToken?: string;

  constructor(context: Context, options: ConnectionOptions) {
    context.httpClient.authenticator = this;
    this.context = context;
    this.options = options;
  }

  getHeaders() {
    if (this.accessToken) {
      return {
        Authorization: `Bearer ${this.accessToken}`
      };
    }
    return {};
  }

  async refreshAccessToken() {
    const { httpClient, apiEndpoint } = this.context;

    const url = `${apiEndpoint}/${REFRESH}`;
    const body = JSON.stringify({
      refresh_token: this.refreshToken
    });

    try {
      const { access_token } = await httpClient
        .request<{
          access_token: string;
        }>("POST", url, { body, retry: false })
        .ready();
      this.accessToken = access_token;
    } catch (error) {
      await this.authenticate();
    }
  }

  async authenticate() {
    const { httpClient, apiEndpoint } = this.context;
    const { username, password } = this.options;
    const url = `${apiEndpoint}/${LOGIN}`;
    const body = JSON.stringify({
      username,
      password
    });

    const { access_token, refresh_token } = await httpClient
      .request<Login>("POST", url, {
        body,
        retry: false
      })
      .ready();

    this.accessToken = access_token;
    this.refreshToken = refresh_token;
  }
}
