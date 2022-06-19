export interface ParamPair {
  paramName: string;
  paramType:
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function'
    | 'json';
  paramValue?: () => any;
  paramDefaultValue: any;
  domType?: 'input' | 'title' | 'button' | 'select' | 'upload' | 'download';
}
export interface ApiParams {
  methodName: string;
  params: ParamPair[];
}
