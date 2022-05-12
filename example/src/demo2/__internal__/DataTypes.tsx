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
    | 'function';
  paramValue?: () => any;
  paramDefaultValue: any;
  domType?: 'input' | 'title' | 'button' | 'select';
}
export interface ApiParams {
  methodName: string;
  params: ParamPair[];
}
export interface ApiParams {
  methodName: string;
  params: ParamPair[];
}
