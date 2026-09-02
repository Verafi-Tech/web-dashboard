export type PageMeta = {
  page: number;
  size: number;
  total: number;
  pages: number;
};

export type PagedResponse<T> = {
  data: T[];
  meta: PageMeta;
};
