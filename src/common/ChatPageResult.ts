/**
 * The pagination class.
 *
 * This class contains the cursor for the next query and the number of records on the page.
 *
 * The class instance is returned when you make a paginated query.
 */
export class ChatPageResult<T> {
  /**
   * The number of records on the current page.
   *
   * If the value of `PageCount` is smaller than the number of records that you expect to get on each page, the current page is the last page.
   */
  pageCount: number;
  /**
   * The data of the generic List<T> type.
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
