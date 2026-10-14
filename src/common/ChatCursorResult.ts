/**
 * 包含游标及分页结果的泛型类。
 *
 * 做为分页获取数据的返回对象。
 */
export class ChatCursorResult<T> {
  /**
   * 游标，用于标记开始取数据的位置。
   */
  cursor: string;
  /**
   * 请求结果。
   */
  list?: Array<T>;
  /**
   * 服务端结果总数。
   *
   * **注意** 仅部分平台的部分 API 会返回该字段。
   * 原生 SDK 未提供该字段时，其值为 `undefined`。
   */
  totalCount?: number;
  constructor(params: {
    cursor: string;
    list?: Array<T>;
    totalCount?: number;
    opt?: { map: (obj: any) => any };
  }) {
    this.cursor = params.cursor;
    this.totalCount = params.totalCount;
    let data: Array<any> = [];
    params.list?.forEach((value) => {
      data.push(params.opt ? params.opt.map(value) : value);
    });
    this.list = data;
  }
}
