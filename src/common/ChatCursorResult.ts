/**
 * The ChatCursorResult class, which specifies the cursor from which to query results.
 * When querying using this class, the SDK returns the queried instance and the cursor.
 */
export type CursorResultMap = (obj: any) => any;

export class ChatCursorResult<T> {
  /**
   * Cursor keyword.
   * The pagination identifier used to request results. The first page can be empty. Subsequent page requests can be used based on the last result returned by the server.
   */
  cursor: string;
  /**
   * Request result.
   */
  list?: Array<T>;
  constructor(params: {
    cursor: string;
    list?: Array<T>;
    opt?: { map: CursorResultMap };
  }) {
    this.cursor = params.cursor;
    let data: Array<any> = [];
    params.list?.forEach((value) => {
      data.push(params.opt ? params.opt.map(value) : value);
    });
    this.list = data;
  }
}
