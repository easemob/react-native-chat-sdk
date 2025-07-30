/**
 * 分页类。
 *
 * 该类包含下次查询的页码以及相应页面上的数据条数。
 *
 * 该对象在分页获取数据时返回。
 */
export class ChatPageResult<T> {
  /**
   * 当前页面上的数据条数。
   *
   * 若 `PageCount` 小于传入的每页要获取的数量，表示当前是最后一页。
   */
  pageCount: number;
  /**
   * 泛型类型 <T>，获取到的数据列表。
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
