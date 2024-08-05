import * as rpm from 'request-promise';

/**
 * sendUrl
 * @param method
 * @param url
 * @param vdata
 * @param headers
 * @param resolveWithFullResponse   Get the full response instead of just the body (true로 설정시)
 */
export const sendUrl = async (method: string, url: string, vdata: any, headers?: any, resolveWithFullResponse?: any, isJson?: any, etcOptions?: Object) => {

  let options: any = {
    method: method,
    uri: url,
    headers: headers,
    resolveWithFullResponse
  };

  if (resolveWithFullResponse) {
    options.resolveWithFullResponse = resolveWithFullResponse;
  }

  if (isJson) {
    options.body = vdata;
    options.json = true;
  } else {
    options.form = vdata;
  }

  // ex) etcOptions = {encoding: null}
  if (etcOptions) {
    options = { ...options, ...etcOptions };
  }

  return rpm(options)
    .then((re: any) => {
      return re;
    })
    .catch((err: any) => {
      return err;
    });

};