/**
 * The ChatPageResult class, which specifies the maximum number per page from which to query results.
 * When querying using this class, the SDK returns the queried instance and the cursor.
 */
export class ChatPageResult<T> {
  /**
   * The value of the current page number. Same as the number of list.
   */
  pageCount: number;
  /**
   * A list of results for the current page number.
   */
  list?: Array<T>;
  constructor(params: {
    pageCount: number;
    list?: Array<T>;
    opt?: { map: (obj: any) => any };
  }) {
    this.pageCount = params.pageCount;
    let data: Array<T> = [];
    params.list?.forEach((value) => {
      data.push(params.opt ? params.opt.map(value) : value);
    });
    this.list = data;
  }
}
